# Claude Code Statusline

A customizable and modular statusline for Claude Code based on a configurable plugin system. Display the information you care about: directory, Git branch, Node version, Claude Code tokens, and more!

## Features

- 🔌 **Modular plugin system**: Enable/disable plugins as needed
- ⚙️ **JSON configuration**: Easy customization via `config.json`
- 📁 **Directory Plugin**: Displays current directory
- 🔀 **Git Plugin**: Shows branch and modification status
- ⬢ **Node Version Plugin**: Displays Node.js version
- 🔵 **Claude Tokens Plugin**: Shows token usage (count + percentage)
- 🎨 ANSI colors for elegant display
- ⚡ Written in TypeScript with fast execution
- 🔄 Automatic updates in Claude Code

## Prerequisites

- Node.js (version 18+)
- pnpm
- Git
- Claude Code

## Installation

1. Clone or copy this project to your working directory

2. Install dependencies:
```bash
pnpm install
```

3. Compile the TypeScript project:
```bash
pnpm build
```

This will generate JavaScript files in the `dist/` folder.

4. Configure Claude Code to use this statusline by creating or modifying `.claude/settings.json`:
```json
{
  "statusLine": {
    "type": "command",
    "command": "node dist/index.js",
    "padding": 0
  }
}
```

Or with absolute path:
```json
{
  "statusLine": {
    "type": "command",
    "command": "node /path/to/statusline/dist/index.js",
    "padding": 0
  }
}
```

## Plugin Configuration

The statusline uses a configurable plugin system with **two configuration levels**:

1. **Default configuration**: Each plugin has its own `config.json` file in `src/plugins/{name}/config.json`
2. **User configuration**: Optional `config.json` file at project root for overrides

Both configurations are **automatically merged**: you only specify what you want to change!

### Default Configuration

All plugins have pre-configured default values. **You don't need to create `config.json` to use the statusline** - it works out-of-the-box with default settings.

Default configurations are located in:
- `src/plugins/directory/config.json`
- `src/plugins/git/config.json`
- `src/plugins/node-version/config.json`
- `src/plugins/claude-tokens/config.json`

### Customization: `config.json` Structure

To customize the statusline, create a `config.json` file at the project root and **specify only what you want to change**:

```json
{
  "plugins": [
    {
      "name": "directory",
      "icon": "📂"
    },
    {
      "name": "git",
      "prefix": " → "
    },
    {
      "name": "node-version",
      "enabled": false
    }
  ]
}
```

**Example**: See `config.json.example` for more customization examples.

#### How Does Merging Work?

Fields specified in your `config.json` **override** the plugin's default values. Unspecified fields keep their default value.

**Merge example:**

Default plugin configuration for directory:
```json
{
  "name": "directory",
  "enabled": true,
  "order": 1,
  "prefix": "",
  "icon": "📁",
  "color": "blue",
  "options": { "showFullPath": false }
}
```

Your config.json:
```json
{
  "plugins": [
    {
      "name": "directory",
      "icon": "📂",
      "options": { "showFullPath": true }
    }
  ]
}
```

Result after merge:
```json
{
  "name": "directory",
  "enabled": true,
  "order": 1,
  "prefix": "",
  "icon": "📂",           ← modified
  "color": "blue",
  "options": { "showFullPath": true }  ← modified
}
```

#### Available Customization Fields

Each plugin can be configured with:
- **`name`** *(required)*: Plugin name
- **`enabled`**: `true` to enable, `false` to disable
- **`order`**: Display order (1 = first, 2 = second, etc.)
- **`prefix`**: Text to display before plugin content
- **`suffix`**: Text to display after plugin content
- **`icon`**: Icon to display
- **`color`**: Text color ("blue", "green", "cyan", "yellow", "magenta", "red")
- **`options`**: Plugin-specific options (varies by plugin)

### Available Plugins

#### 📁 Directory Plugin

Displays the current directory name.

**Common options:**
- `prefix` (string): Text before directory (default: "")
- `suffix` (string): Text after directory (default: "")
- `icon` (string): Icon to display (default: "📁")
- `color` (string): Text color (default: "blue")

**Specific options:**
- `showFullPath` (boolean): Show full path instead of name (default: false)

**Example:**
```json
{
  "name": "directory",
  "enabled": true,
  "order": 1,
  "prefix": "",
  "suffix": "",
  "icon": "📂",
  "color": "cyan",
  "options": {
    "showFullPath": false
  }
}
```

#### 🔀 Git Plugin

Displays the active Git branch and modification status.

**Common options:**
- `prefix` (string): Text before branch (default: " on ")
- `suffix` (string): Text after branch (default: "")
- `icon` (string): Icon to display (default: "")
- `color` (string): Clean branch color (default: "green")

**Specific options:**
- `showStatus` (boolean): Show modification status (default: true)
- `dirtyIcon` (string): Icon for modifications (default: "±")
- `dirtyColor` (string): Color with modifications (default: "yellow")

**Example:**
```json
{
  "name": "git",
  "enabled": true,
  "order": 2,
  "prefix": " → ",
  "suffix": "",
  "icon": "",
  "color": "green",
  "options": {
    "showStatus": true,
    "dirtyIcon": "✗",
    "dirtyColor": "red"
  }
}
```

#### ⬢ Node Version Plugin

Displays the Node.js version.

**Common options:**
- `prefix` (string): Text before version (default: "")
- `suffix` (string): Text after version (default: "")
- `icon` (string): Icon to display (default: "⬢")
- `color` (string): Text color (default: "green")

**Specific options:**
- `format` (string): "short" (18.0.0) or "full" (v18.0.0) (default: "short")

**Example:**
```json
{
  "name": "node-version",
  "enabled": true,
  "order": 3,
  "prefix": " ",
  "suffix": "",
  "icon": "🟢",
  "color": "green",
  "options": {
    "format": "short"
  }
}
```

#### 🔵 Claude Tokens Plugin

Displays Claude Code token usage.

**Common options:**
- `prefix` (string): Text before tokens (default: "")
- `suffix` (string): Text after tokens (default: "")
- `icon` (string): Icon to display (default: "🔵")
- `color` (string): Text color (default: "cyan")

**Specific options:**
- `showPercentage` (boolean): Show percentage (default: true)
- `showCount` (boolean): Show token count (default: true)
- `format` (string): "compact" (59.1k/200k) or "full" (59,100/200,000) (default: "compact")

**Example:**
```json
{
  "name": "claude-tokens",
  "enabled": true,
  "order": 4,
  "prefix": " ",
  "suffix": "",
  "icon": "📊",
  "color": "magenta",
  "options": {
    "showPercentage": true,
    "showCount": true,
    "format": "compact"
  }
}
```

### Disabling a Plugin

To disable a plugin, set `enabled` to `false`:

```json
{
  "name": "node-version",
  "enabled": false,
  "order": 3,
  "options": {}
}
```

### Changing Display Order

Modify the `order` value to change display order:

```json
{
  "plugins": [
    { "name": "git", "enabled": true, "order": 1 },
    { "name": "directory", "enabled": true, "order": 2 }
  ]
}
```

Result: `main ± 📁 statusline`

## Rendering Examples

### Default configuration (all plugins enabled)
```
📁 statusline on main ⬢ 18.0.0 🔵 59.1k/200k (29.6%)
```

### Directory without Git
```
📁 my-project ⬢ 18.0.0 🔵 45.2k/200k (22.6%)
```

### Directory with Git (no modifications)
```
📁 my-project on main ⬢ 18.0.0 🔵 59.1k/200k (29.6%)
```

### Directory with Git (uncommitted modifications)
```
📁 my-project on main± ⬢ 18.0.0 🔵 59.1k/200k (29.6%)
```

### Minimal configuration (directory + git only)
```
📁 statusline on main±
```

### Custom configuration
With this configuration:
```json
{
  "plugins": [
    { "name": "git", "order": 1 },
    { "name": "directory", "order": 2 },
    { "name": "claude-tokens", "order": 3, "options": { "showCount": false } }
  ]
}
```

Result:
```
main± 📁 statusline 🔵 29.6%
```

### Color Preview

In your terminal, the statusline will appear with the following colors:
- **Directory**: Bright blue bold with 📁 icon
- **"on"**: Discreet gray
- **Clean branch**: Green
- **Branch with modifications**: Yellow with ± symbol
- **Node version**: Green with ⬢ icon
- **Claude tokens**: Cyan with 🔵 icon

## Project Structure

```
statusline/
├── .claude/
│   └── settings.json              # Claude Code configuration
├── src/
│   ├── types/
│   │   └── plugin.ts              # Plugin interfaces and types
│   ├── lib/
│   │   ├── constant.ts            # ANSI color constants
│   │   ├── merge.ts               # Deep merge utility
│   │   └── plugin-manager.ts      # Plugin manager
│   ├── plugins/
│   │   ├── directory/
│   │   │   ├── config.json        # ⭐ Default configuration
│   │   │   └── index.ts           # Directory plugin
│   │   ├── git/
│   │   │   ├── config.json        # ⭐ Default configuration
│   │   │   └── index.ts           # Git plugin
│   │   ├── node-version/
│   │   │   ├── config.json        # ⭐ Default configuration
│   │   │   └── index.ts           # Node version plugin
│   │   └── claude-tokens/
│   │       ├── config.json        # ⭐ Default configuration
│   │       ├── index.ts           # Claude tokens plugin
│   │       └── transcript-parser.ts  # Transcript parsing utility
│   └── index.ts                   # Main entry point
├── dist/                          # Compiled JavaScript files (generated by pnpm build)
│   ├── types/
│   ├── lib/
│   ├── plugins/
│   │   ├── directory/
│   │   │   └── config.json        # ⭐ Default config (copied)
│   │   ├── git/
│   │   │   └── config.json        # ⭐ Default config (copied)
│   │   ├── node-version/
│   │   │   └── config.json        # ⭐ Default config (copied)
│   │   └── claude-tokens/
│   │       └── config.json        # ⭐ Default config (copied)
│   └── index.js
├── config.json                    # User configuration (optional - for overrides)
├── config.json.example            # Customization examples
├── LICENSE                        # MIT License
├── package.json
├── tsconfig.json
└── README.md
```

## Development

### Available Scripts

- **`pnpm dev`**: Run statusline in development mode (via tsx)
- **`pnpm build`**: Compile TypeScript to JavaScript
- **`pnpm watch`**: Compile in watch mode

### Testing the Statusline Locally

**In production (with compiled files):**

After compiling with `pnpm build`, test with:

```bash
echo '{"workspace":{"current_dir":"'$(pwd)'"}}' | node dist/index.js
```

Or with a specific directory:

```bash
echo '{"workspace":{"current_dir":"/path/to/project"}}' | node dist/index.js
```

**In development (without compilation):**

To test quickly without compiling:

```bash
echo '{"workspace":{"current_dir":"'$(pwd)'"}}' | pnpm dev
```

### Development Mode

To develop and test quickly, you have two options:

**Option 1: Watch mode (recommended)**

1. Start watch mode for automatic TypeScript compilation:
```bash
pnpm watch
```

2. In another terminal, test with the compiled version:
```bash
echo '{"workspace":{"current_dir":"'$(pwd)'"}}' | node dist/index.js
```

**Option 2: Use tsx directly**

Test directly without compilation:
```bash
echo '{"workspace":{"current_dir":"'$(pwd)'"}}' | pnpm dev
```

Note: Don't forget to rebuild (`pnpm build`) before committing or using the statusline in production with Claude Code.

## Customization

### Modifying Colors

Edit the `src/lib/constant.ts` file to customize ANSI colors:

```typescript
export const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  // Add your own colors
} as const;
```

### Creating a Custom Plugin

You can easily create your own plugins:

1. **Create a new directory in `src/plugins/`** (e.g., `src/plugins/time/`)

2. **Create the file `src/plugins/time/config.json`** with default values:

```json
{
  "name": "time",
  "enabled": true,
  "order": 5,
  "prefix": " ",
  "suffix": "",
  "icon": "🕐",
  "color": "cyan",
  "options": {
    "format": "24h"
  }
}
```

3. **Create the file `src/plugins/time/index.ts`**:

```typescript
import { Plugin, PluginContext, PluginConfig, PluginResult } from '../../types/plugin.js';
import { colors } from '../../lib/constant.js';

interface TimeOptions {
  format?: '12h' | '24h';
}

export const timePlugin: Plugin = {
  name: 'time',

  execute(context: PluginContext, config: PluginConfig): PluginResult {
    try {
      // Common options (from config root)
      const prefix = config.prefix || '';
      const suffix = config.suffix || '';
      const icon = config.icon || '🕐';
      const color = config.color || 'cyan';

      // Specific options (from config.options)
      const options = config.options as TimeOptions | undefined;
      const format = options?.format || '24h';

      const now = new Date();
      let timeStr = '';

      if (format === '12h') {
        timeStr = now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      } else {
        timeStr = now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }

      const colorCode = colors[color as keyof typeof colors] || colors.cyan;
      const content = `${prefix}${colorCode}${icon} ${timeStr}${colors.reset}${suffix}`;

      return { content };
    } catch (error) {
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error in time plugin',
      };
    }
  },
};
```

4. **Register the plugin in `src/lib/plugin-manager.ts`**

```typescript
import { timePlugin } from '../plugins/time/index.js';

// In the constructor
this.registerPlugin(timePlugin);
```

5. **Compile and test**

```bash
pnpm build
echo '{"workspace":{"current_dir":"'$(pwd)'"}}' | node dist/index.js
```

### Available Icons

Some icon ideas to use:
- 📁 Folder
- 🔀 Git branch
- ✨ Clean
- ⚠️ Warning
- 🚀 Rocket
- 💻 Code
- 🎯 Target

## Input Format

The statusline receives a JSON object via stdin from Claude Code:

```typescript
interface ClaudeCodeInput {
  workspace?: {
    current_dir?: string;
  };
  model?: {
    display_name?: string;
  };
}
```

You can extend the interface to use other information provided by Claude Code.

## Troubleshooting

### Statusline doesn't appear
- Check that `.claude/settings.json` file exists and is properly configured
- Make sure you've compiled the project: `pnpm build`
- Verify that `dist/` folder exists and contains `index.js`
- Test the statusline manually to see errors: `echo '{}' | node dist/index.js`

### Colors don't display
- Check that your terminal supports ANSI codes
- Some terminals require specific configurations for colors

### "Cannot find module" error
- Make sure you've compiled the project: `pnpm build`
- Check that all files are present in `dist/`
- Reinstall dependencies: `pnpm install`

### Changes are not applied
- Don't forget to recompile after each modification: `pnpm build`
- Or use watch mode during development: `pnpm watch`

## Technologies Used

- **TypeScript**: Main language
- **Node.js**: Runtime for production execution
- **tsx**: Development tool for testing without compilation
- **pnpm**: Package manager
- **Git**: Git integration to display branch

## License

MIT

## Author

Created for Claude Code
