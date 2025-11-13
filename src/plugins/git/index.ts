import { execSync } from 'child_process';
import { Plugin, PluginContext, PluginConfig, PluginResult } from '../../types/plugin.js';
import { colors } from '../../lib/constant.js';

interface GitOptions {
  showStatus?: boolean;
  dirtyIcon?: string;
  dirtyColor?: string;
}

function getGitBranch(cwd: string): string | null {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
    return branch;
  } catch (error) {
    return null;
  }
}

function getGitStatus(cwd: string): boolean {
  try {
    const status = execSync('git status --porcelain', {
      cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
    return status.length > 0;
  } catch (error) {
    return false;
  }
}

export const gitPlugin: Plugin = {
  name: 'git',

  execute(context: PluginContext, config: PluginConfig): PluginResult {
    try {
      const gitBranch = getGitBranch(context.currentDir);

      // If no git branch, display nothing
      if (!gitBranch) {
        return { content: '' };
      }

      // Common options (from config root)
      const prefix = config.prefix || ' on ';
      const suffix = config.suffix || '';
      const icon = config.icon || '';
      const color = config.color || 'green';

      // Specific options (from config.options)
      const options = config.options as GitOptions | undefined;
      const showStatus = options?.showStatus ?? true;
      const hasChanges = showStatus ? getGitStatus(context.currentDir) : false;

      const gitIcon = hasChanges ? (options?.dirtyIcon || '±') : '';
      const branchColorName = hasChanges ? (options?.dirtyColor || 'yellow') : color;
      const branchColor = colors[branchColorName as keyof typeof colors] || colors.green;

      const content = `${prefix}${icon}${branchColor}${gitBranch}${gitIcon}${colors.reset}${suffix}`;

      return { content };
    } catch (error) {
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error in git plugin',
      };
    }
  },
};
