# Node Version Plugin

Displays the current Node.js version in the statusline.

## Features

- Shows Node.js version from `process.version`
- Supports short and full format
- Customizable icon and color
- No external dependencies

## Default Configuration

```json
{
  "name": "node-version",
  "icon": "⬢",
  "color": "green",
  "options": {
    "format": "short"
  }
}
```

## Configuration Options

### Common Options

- **`icon`** (string): Icon to display before the version
  - Default: `"⬢"` (hexagon, Node.js logo)
  - Example: `"⬢"`, `"📦"`, `"node"`, `""`

- **`color`** (string): Text color for the version
  - Default: `"green"`
  - Available: `"blue"`, `"cyan"`, `"green"`, `"yellow"`, `"magenta"`, `"red"`, `"gray"`

### Specific Options

- **`format`** (string): Version display format
  - Default: `"short"`
  - Options:
    - `"short"`: Remove leading "v" (e.g., `18.0.0`)
    - `"full"`: Keep leading "v" (e.g., `v18.0.0`)

## Usage Examples

### Default (short format)

```json
{
  "plugins": [
    {
      "name": "node-version"
    }
  ]
}
```

**Output:** `⬢ 18.0.0`

### Full Format

```json
{
  "plugins": [
    {
      "name": "node-version",
      "options": {
        "format": "full"
      }
    }
  ]
}
```

**Output:** `⬢ v18.0.0`

### Custom Icon and Color

```json
{
  "plugins": [
    {
      "name": "node-version",
      "icon": "📦",
      "color": "cyan"
    }
  ]
}
```

**Output:** `📦 18.0.0` (in cyan)

### Minimal (no icon)

```json
{
  "plugins": [
    {
      "name": "node-version",
      "icon": ""
    }
  ]
}
```

**Output:** `18.0.0`

### Text Label

```json
{
  "plugins": [
    {
      "name": "node-version",
      "icon": "node"
    }
  ]
}
```

**Output:** `node 18.0.0`

## Implementation Details

- **Version source**: `process.version`
  - Built-in Node.js global variable
  - Always available, no external calls
  - Example value: `"v18.0.0"`

- **Format handling**:
  - Short: Uses `.replace(/^v/, '')` to remove leading "v"
  - Full: Uses raw `process.version`

- **Performance**: Instant (no I/O, no external commands)

- **Always available**: This plugin always returns content (never empty)

## Example Rendering

```bash
# Default
⬢ 18.0.0

# Full format
⬢ v18.0.0

# Custom style
📦 20.11.0

# Different colors
⬢ 18.0.0  # (in green - default)
⬢ 18.0.0  # (in cyan)
```

## Notes

- Version is read from the running Node.js process
- No file system access required
- No external commands executed
- Format can be changed at runtime (no restart needed)
