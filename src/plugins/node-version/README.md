# Node Version Plugin

Displays the current Node.js version in the statusline.

## Features

- Shows Node.js version from `process.version`
- Supports short and full format
- Customizable prefix and color
- No external dependencies

## Default Configuration

```json
{
  "name": "node-version",
  "prefix": "Node:",
  "color": "green",
  "options": {
    "format": "short"
  }
}
```

## Configuration Options

### Common Options

- **`prefix`** (string): Prefix to display before the version
  - Default: `"Node:"`
  - Example: `"Node:"`, `"⬢"`, `"📦"`, `"node"`, `""`

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

**Output:** `Node: 18.0.0`

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

**Output:** `Node: v18.0.0`

### Custom Prefix and Color

```json
{
  "plugins": [
    {
      "name": "node-version",
      "prefix": "📦",
      "color": "cyan"
    }
  ]
}
```

**Output:** `📦 18.0.0` (in cyan)

### Minimal (no prefix)

```json
{
  "plugins": [
    {
      "name": "node-version",
      "prefix": ""
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
      "prefix": "node"
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
Node: 18.0.0

# Full format
Node: v18.0.0

# Custom style
📦 20.11.0

# Different colors
Node: 18.0.0  # (in green - default)
Node: 18.0.0  # (in cyan)
```

## Notes

- Version is read from the running Node.js process
- No file system access required
- No external commands executed
- Format can be changed at runtime (no restart needed)
