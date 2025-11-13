# Claude Tokens Plugin

Displays Claude Code token usage and percentage in the statusline.

## Features

- Shows token usage from Claude Code sessions
- Displays used/max tokens and percentage
- Supports compact and full formats
- Parses JSONL transcript files for accurate token counts
- Fallback to legacy input methods
- Automatically hides when no token data available

## Default Configuration

```json
{
  "name": "claude-tokens",
  "icon": "🔵",
  "color": "cyan",
  "options": {
    "showPercentage": true,
    "showCount": true,
    "format": "compact"
  }
}
```

## Configuration Options

### Common Options

- **`icon`** (string): Icon to display before token info
  - Default: `"🔵"`
  - Example: `"🔵"`, `"📊"`, `"💬"`, `""`

- **`color`** (string): Text color for token info
  - Default: `"cyan"`
  - Available: `"blue"`, `"cyan"`, `"green"`, `"yellow"`, `"magenta"`, `"red"`, `"gray"`

### Specific Options

- **`showPercentage`** (boolean): Show percentage of context used
  - Default: `true`

- **`showCount`** (boolean): Show token counts
  - Default: `true`

- **`format`** (string): Display format
  - Default: `"compact"`
  - Options:
    - `"compact"`: Uses "k" suffix (e.g., `59.1k/200k`)
    - `"full"`: Full numbers with commas (e.g., `59,100/200,000`)

## Display Formats

### Compact Format

| Options | Output |
|---------|--------|
| Both count + percentage | `🔵 59.1k/200k (29.6%)` |
| Count only | `🔵 59.1k` |
| Percentage only | `🔵 29.6%` |

### Full Format

| Options | Output |
|---------|--------|
| Both count + percentage | `🔵 59,100/200,000 (29.6%)` |
| Count only | `🔵 59,100/200,000` |
| Percentage only | `🔵 (29.6%)` |

## Usage Examples

### Default (compact with both)

```json
{
  "plugins": [
    {
      "name": "claude-tokens"
    }
  ]
}
```

**Output:** `🔵 59.1k/200k (29.6%)`

### Full Format

```json
{
  "plugins": [
    {
      "name": "claude-tokens",
      "options": {
        "format": "full"
      }
    }
  ]
}
```

**Output:** `🔵 59,100/200,000 (29.6%)`

### Percentage Only

```json
{
  "plugins": [
    {
      "name": "claude-tokens",
      "options": {
        "showCount": false,
        "showPercentage": true
      }
    }
  ]
}
```

**Output:** `🔵 29.6%`

### Count Only

```json
{
  "plugins": [
    {
      "name": "claude-tokens",
      "options": {
        "showCount": true,
        "showPercentage": false
      }
    }
  ]
}
```

**Output:** `🔵 59.1k/200k`

### Custom Icon and Color

```json
{
  "plugins": [
    {
      "name": "claude-tokens",
      "icon": "📊",
      "color": "magenta"
    }
  ]
}
```

**Output:** `📊 59.1k/200k (29.6%)` (in magenta)

## Implementation Details

### Data Sources (in order of priority)

1. **JSONL Transcript** (`context.input.transcript_path`)
   - Most accurate method
   - Parses `.jsonl` transcript file
   - Extracts token usage from conversation events
   - Preferred when available

2. **Context Object** (`context.input.context`)
   - Legacy fallback method
   - Uses `used_tokens` and `max_tokens` fields
   - Claude Code older versions

3. **Usage Object** (`context.input.usage`)
   - Legacy fallback method
   - Uses `total_tokens` field
   - Assumes 200k max tokens

### Transcript Parsing

The plugin parses JSONL files line by line looking for:

```json
{
  "type": "conversation_event",
  "data": {
    "usage": {
      "input_tokens": 1234,
      "output_tokens": 567,
      "cache_creation_input_tokens": 100,
      "cache_read_input_tokens": 200
    }
  }
}
```

Calculation:
```
totalTokens = input_tokens + output_tokens +
              cache_creation_input_tokens +
              cache_read_input_tokens
```

### Behavior

- **No data available**: Returns empty content (plugin hidden)
- **Both tokens = 0**: Returns empty content
- **Has data**: Shows formatted output based on options

### Performance

- Reads and parses transcript file on each execution
- JSONL parsing is line-by-line (memory efficient)
- Fast even with large transcript files (~ 10-50ms)

## Example Rendering

```bash
# Compact format (default)
🔵 59.1k/200k (29.6%)

# Full format
🔵 59,100/200,000 (29.6%)

# Percentage only
🔵 29.6%

# Count only
🔵 59.1k/200k

# Custom style
📊 59.1k/200k (29.6%)  # (in magenta)
```

## Notes

- Token data comes from Claude Code's session information
- The plugin automatically hides if no token data is available
- Percentage is calculated as: `(used / max) * 100`
- Compact format uses 1 decimal place for "k" values
- Full format uses locale-specific number formatting (commas)
- The `200k` default is Claude Sonnet's context window size
