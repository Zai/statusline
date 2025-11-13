import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Plugin, PluginContext, PluginConfig, PluginResult } from '../../types/plugin.js';
import { colors } from '../../lib/constant.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface GitOptions {
  showFileCount?: boolean;
  showLineStats?: boolean;
  dirtyColor?: string;
}

// Load default config
const defaultConfig: PluginConfig = JSON.parse(
  readFileSync(join(__dirname, 'default.json'), 'utf-8')
);

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


function getFileCount(cwd: string): number {
  try {
    const status = execSync('git status --porcelain', {
      cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
    if (!status) return 0;
    return status.split('\n').length;
  } catch (error) {
    return 0;
  }
}

function getLineStats(cwd: string): { additions: number; deletions: number } {
  try {
    const stats = execSync('git diff --numstat', {
      cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();

    if (!stats) return { additions: 0, deletions: 0 };

    let additions = 0;
    let deletions = 0;

    const lines = stats.split('\n');
    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length >= 2) {
        additions += parseInt(parts[0]) || 0;
        deletions += parseInt(parts[1]) || 0;
      }
    }

    return { additions, deletions };
  } catch (error) {
    return { additions: 0, deletions: 0 };
  }
}

export default {
  name: 'git',

  execute(context: PluginContext, userConfig: PluginConfig): PluginResult {
    try {
      // Merge default config with user config
      const config = { ...defaultConfig, ...userConfig };

      const gitBranch = getGitBranch(context.currentDir);

      // If no git branch, display nothing
      if (!gitBranch) {
        return { content: '' };
      }

      const options = config.options as GitOptions | undefined;

      // Build display parts
      const parts: string[] = [];

      // Branch
      const branchColorCode = colors[config.color as keyof typeof colors];
      parts.push(`${config.icon}${branchColorCode}${gitBranch}${colors.reset}`);

      // Stats
      const statsParts: string[] = [];
      if (options?.showFileCount) {
        const fileCount = getFileCount(context.currentDir);
        if (fileCount > 0) statsParts.push(`!${fileCount}`);
      }
      if (options?.showLineStats) {
        const lineStats = getLineStats(context.currentDir);
        if (lineStats.additions > 0 || lineStats.deletions > 0) {
          statsParts.push(`+${lineStats.additions}/-${lineStats.deletions}`);
        }
      }

      const dirtyColorCode = colors[options?.dirtyColor as keyof typeof colors];
      parts.push(statsParts.length > 0 ? `${dirtyColorCode}${statsParts.join(' ')}${colors.reset}` : '');

      const content = parts.filter(Boolean).join(' ');

      return { content };
    } catch (error) {
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error in git plugin',
      };
    }
  },
} as Plugin;
