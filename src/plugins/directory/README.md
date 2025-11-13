# Directory Plugin

Displays the current working directory in the statusline.

## Features

- Shows directory name by default
- Option to show full path
- Customizable icon and color
- Bright text style for better visibility

## Default Configuration

```json
{
  "name": "directory",
  "icon": "📁",
  "color": "blue",
  "options": {
    "showFullPath": false
  }
}
```

## Configuration Options

### Common Options

- **`icon`** (string): Icon to display before the directory name
  - Default: `"📁"`
  - Example: `"📂"`, `"🗂️"`, `""`

- **`color`** (string): Text color for the directory
  - Default: `"blue"`
  - Available: `"blue"`, `"cyan"`, `"green"`, `"yellow"`, `"magenta"`, `"red"`, `"gray"`

### Specific Options

- **`showFullPath`** (boolean): Show full directory path instead of just the name
  - Default: `false`
  - `false`: Show only directory name (e.g., `"statusline"`)
  - `true`: Show full path (e.g., `"/Users/name/projects/statusline"`)

## Usage Examples

### Default (directory name only)

```json
{
  "plugins": [
    {
      "name": "directory"
    }
  ]
}
```

**Output:** `📁 statusline`

### Full Path

```json
{
  "plugins": [
    {
      "name": "directory",
      "options": {
        "showFullPath": true
      }
    }
  ]
}
```

**Output:** `📁 /Users/name/projects/statusline`

### Custom Icon and Color

```json
{
  "plugins": [
    {
      "name": "directory",
      "icon": "📂",
      "color": "cyan"
    }
  ]
}
```

**Output:** `📂 statusline` (in cyan)

### Minimal (no icon)

```json
{
  "plugins": [
    {
      "name": "directory",
      "icon": ""
    }
  ]
}
```

**Output:** `statusline`

## Implementation Details

- Uses `context.dirName` for the directory name
- Uses `context.currentDir` for the full path
- Applies `bright` style for better visibility
- No external dependencies or command execution
- Always returns content (never empty)

## Example Rendering

```bash
# Default
📁 my-project

# With full path
📁 /Users/username/Development/my-project

# Custom style
🗂️ my-project  # (in cyan, bright)
```
