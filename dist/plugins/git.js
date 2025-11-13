import { execSync } from 'child_process';
import { colors } from '../lib/constant.js';
function getGitBranch(cwd) {
    try {
        const branch = execSync('git rev-parse --abbrev-ref HEAD', {
            cwd,
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'ignore'],
        }).trim();
        return branch;
    }
    catch (error) {
        return null;
    }
}
function getGitStatus(cwd) {
    try {
        const status = execSync('git status --porcelain', {
            cwd,
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'ignore'],
        }).trim();
        return status.length > 0;
    }
    catch (error) {
        return false;
    }
}
export const gitPlugin = {
    name: 'git',
    execute(context, options) {
        try {
            const gitBranch = getGitBranch(context.currentDir);
            // Si pas de branche git, ne rien afficher
            if (!gitBranch) {
                return { content: '' };
            }
            const showStatus = options?.showStatus ?? true;
            const separator = options?.separator || 'on';
            const hasChanges = showStatus ? getGitStatus(context.currentDir) : false;
            const gitIcon = hasChanges
                ? options?.icons?.dirty || '±'
                : options?.icons?.clean || '';
            const branchColorName = hasChanges
                ? options?.colors?.dirty || 'yellow'
                : options?.colors?.clean || 'green';
            const branchColor = colors[branchColorName] || colors.green;
            const content = ` ${colors.gray}${separator}${colors.reset} ${branchColor}${gitBranch}${gitIcon}${colors.reset}`;
            return { content };
        }
        catch (error) {
            return {
                content: '',
                error: error instanceof Error ? error.message : 'Unknown error in git plugin',
            };
        }
    },
};
