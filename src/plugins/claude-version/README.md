# Claude Version Plugin

Displays the current Claude Code version in the statusline.

## Features

- Shows Claude Code version from input data
- Customizable icon and color
- Simple and lightweight
- Hides when version is unavailable

## Default Configuration

```json
{
  "name": "claude-version",
  "icon": "🤖",
  "color": "cyan"
}
```

## Configuration Options

### Common Options

- **`icon`** (string): Icon to display before the version
  - Default: `"🤖"` (robot face)
  - Example: `"🤖"`, `"📟"`, `"claude"`, `"v"`

- **`color`** (string): Text color for the version
  - Default: `"cyan"`
  - Available: `"blue"`, `"cyan"`, `"green"`, `"yellow"`, `"magenta"`, `"red"`, `"gray"`

## Usage Examples

### Default

```json
{
  "plugins": [
    {
      "name": "claude-version"
    }
  ]
}
```

**Output:** `🤖 2.0.37`

### Custom Icon and Color

```json
{
  "plugins": [
    {
      "name": "claude-version",
      "icon": "📟",
      "color": "magenta"
    }
  ]
}
```

**Output:** `📟 2.0.37` (in magenta)

### Minimal (no icon)

```json
{
  "plugins": [
    {
      "name": "claude-version",
      "icon": ""
    }
  ]
}
```

**Output:** `2.0.37`

### Text Label

```json
{
  "plugins": [
    {
      "name": "claude-version",
      "icon": "v"
    }
  ]
}
```

**Output:** `v 2.0.37`

## Implementation Details

- **Version source**: `context.input.version`
  - Provided by Claude Code via stdin
  - Example value: `"2.0.37"`

- **Availability**:
  - Returns empty content if version is not available
  - Always safe to include in plugin list

- **Performance**: Instant (no I/O, direct property access)

## Example Rendering

```bash
# Default
🤖 2.0.37

# Custom icon
📟 2.0.37

# Different colors
🤖 2.0.37  # (in cyan - default)
🤖 2.0.37  # (in magenta)
🤖 2.0.37  # (in green)
```

## Notes

- Version is read from Claude Code's input data
- Plugin shows nothing if version is unavailable
- No external commands or file system access required
- Useful for tracking which Claude Code version you're using
