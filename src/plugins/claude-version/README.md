# Claude Version Plugin

Displays the current Claude Code version in the statusline.

## Features

- Shows Claude Code version from input data
- Customizable prefix and color
- Simple and lightweight
- Hides when version is unavailable

## Default Configuration

```json
{
  "name": "claude-version",
  "prefix": "Claude:",
  "color": "cyan"
}
```

## Configuration Options

### Common Options

- **`prefix`** (string): Prefix to display before the version
  - Default: `"Claude:"`
  - Example: `"Claude:"`, `"🤖"`, `"📟"`, `"v"`

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

**Output:** `Claude: 2.0.37`

### Custom Prefix and Color

```json
{
  "plugins": [
    {
      "name": "claude-version",
      "prefix": "📟",
      "color": "magenta"
    }
  ]
}
```

**Output:** `📟 2.0.37` (in magenta)

### Minimal (no prefix)

```json
{
  "plugins": [
    {
      "name": "claude-version",
      "prefix": ""
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
      "prefix": "v"
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
Claude: 2.0.37

# Custom prefix
📟 2.0.37

# Different colors
Claude: 2.0.37  # (in cyan - default)
Claude: 2.0.37  # (in magenta)
Claude: 2.0.37  # (in green)
```

## Notes

- Version is read from Claude Code's input data
- Plugin shows nothing if version is unavailable
- No external commands or file system access required
- Useful for tracking which Claude Code version you're using
