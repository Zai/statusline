# Git Plugin

Displays the current Git branch and modification statistics in the statusline.

## Features

- Shows current Git branch
- Displays number of modified files
- Shows line additions/deletions
- Separate colors for branch and stats
- Automatically hides when not in a Git repository

## Default Configuration

```json
{
  "name": "git",
  "prefix": "",
  "color": "green",
  "options": {
    "showFileCount": true,
    "showLineStats": true,
    "dirtyColor": "yellow"
  }
}
```

## Configuration Options

### Common Options

- **`icon`** (string): Prefix to display before the branch name
  - Default: `""` (Git branch icon)
  - Example: `""`, `"±"`, `""`

- **`color`** (string): Color for the branch name (when clean or with changes)
  - Default: `"green"`
  - Available: `"blue"`, `"cyan"`, `"green"`, `"yellow"`, `"magenta"`, `"red"`, `"gray"`

### Specific Options

- **`showFileCount`** (boolean): Show number of modified files
  - Default: `true`
  - Format: `!3` (3 modified files)

- **`showLineStats`** (boolean): Show line additions and deletions
  - Default: `true`
  - Format: `+45/-12` (45 lines added, 12 deleted)

- **`dirtyColor`** (string): Color for the modification stats (file count + line stats)
  - Default: `"yellow"`
  - Only applies to the `!N +X/-Y` part, not the branch name

## Display Format

### Clean Repository

```
main
```

### With Modifications

```
main !3 +45/-12
```

Where:
- `main` = branch name (in `color`)
- `!3` = 3 modified files (in `dirtyColor`, hardcoded "!")
- `+45/-12` = 45 lines added, 12 deleted (in `dirtyColor`)

## Usage Examples

### Default (all stats enabled)

```json
{
  "plugins": [
    {
      "name": "git"
    }
  ]
}
```

**Output:** `main !3 +45/-12` (branch in green, stats in yellow)

### File Count Only

```json
{
  "plugins": [
    {
      "name": "git",
      "options": {
        "showFileCount": true,
        "showLineStats": false
      }
    }
  ]
}
```

**Output:** `main !3`

### Line Stats Only

```json
{
  "plugins": [
    {
      "name": "git",
      "options": {
        "showFileCount": false,
        "showLineStats": true
      }
    }
  ]
}
```

**Output:** `main +45/-12`

### Custom Colors

```json
{
  "plugins": [
    {
      "name": "git",
      "color": "cyan",
      "options": {
        "dirtyColor": "red"
      }
    }
  ]
}
```

**Output:** `main !3 +45/-12` (branch in cyan, stats in red)

### Branch Only (no stats)

```json
{
  "plugins": [
    {
      "name": "git",
      "options": {
        "showFileCount": false,
        "showLineStats": false
      }
    }
  ]
}
```

**Output:** `main`

### Custom Prefix

```json
{
  "plugins": [
    {
      "name": "git",
      "prefix": ""
    }
  ]
}
```

**Output:** ` main !3 +45/-12`

## Implementation Details

### Git Commands Used

- **Branch detection**: `git rev-parse --abbrev-ref HEAD`
  - Returns current branch name
  - Fails silently if not in a Git repo

- **File count**: `git status --porcelain`
  - Counts modified, added, deleted files
  - Includes staged and unstaged changes

- **Line stats**: `git diff --numstat`
  - Shows lines added/deleted per file
  - Sums up all changes

### Behavior

- **Not in Git repo**: Returns empty content (plugin hidden)
- **Clean repo**: Shows only branch name
- **Modified files**: Shows branch + stats based on options
- **Error handling**: Returns empty content on any Git command failure

### Performance

- Uses `stdio: ['pipe', 'pipe', 'ignore']` to suppress stderr
- Commands are synchronous but fast (< 50ms typically)
- Errors are ignored silently (no console spam)

## Example Rendering

```bash
# Clean repository
 main

# With modifications
 main !2 +15/-3

# Many changes
 feature-branch !12 +234/-89

# Staging area changes
 develop !5 +120/-45
```

## Notes

- The `!` before the file count is **hardcoded** (not configurable)
- Stats only appear if there are actual changes
- Branch name always uses `color`, stats always use `dirtyColor`
- If `showFileCount` is false, line stats won't show either (file count is required)
