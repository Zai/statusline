# Claude Code Statusline

A customizable and modular statusline for Claude Code based on a configurable plugin system. Display the information you care about: directory, Git branch, Node version, Claude Code tokens, and more!

## Features

- 🔌 **Dynamic plugin system**: Plugins loaded on-demand from config
- ⚙️ **JSON configuration**: Easy customization via `config.json`
- 🚀 **Zero-config required**: Works out-of-the-box with sensible defaults
- 📁 **Directory Plugin**: Displays current directory
- 🔀 **Git Plugin**: Shows branch and modification status
- ⬢ **Node Version Plugin**: Displays Node.js version
- 🔵 **Claude Tokens Plugin**: Shows token usage (count + percentage)
- 🎨 ANSI colors for elegant display
- ⚡ Written in TypeScript with fast execution
- 🔄 Automatic updates in Claude Code
- ❌ **Visible error handling**: Failed plugins show as `❌ plugin-name`

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

The statusline uses a **dynamic plugin system** where plugins are loaded on-demand:

1. **Default configuration**: Each plugin loads its own `config.json` with default values
2. **User configuration**: Optional `config.json` file at project root to enable/customize plugins
3. **Dynamic loading**: Only plugins listed in `config.json` are loaded into memory
4. **Automatic merging**: Plugins merge their defaults with user overrides

**You don't need to create `config.json` to use the statusline** - it works out-of-the-box!

### Quick Start

Create a `config.json` at the project root:

```json
{
  "separator": " | ",
  "plugins": [
    { "name": "directory" },
    { "name": "git" },
    { "name": "node-version" },
    { "name": "claude-tokens" }
  ]
}
```

**How it works:**
- **Plugin order** = array position (first in array = first displayed)
- **Enabled plugins** = plugins present in the array
- **Disabled plugins** = simply omit them from the array

### Customizing Plugins

Override any plugin setting by adding fields:

```json
{
  "plugins": [
    {
      "name": "directory",
      "icon": "📂",
      "options": { "showFullPath": true }
    },
    {
      "name": "git",
      "color": "cyan",
      "options": { "dirtyColor": "red" }
    }
  ]
}
```

**Global options:**
- **`separator`** (string): Text displayed between plugins (default: `" "`)

**Per-plugin options:**
- **`name`** *(required)*: Plugin name
- **`icon`**: Custom icon
- **`color`**: Text color (`"blue"`, `"green"`, `"cyan"`, `"yellow"`, `"magenta"`, `"red"`, `"gray"`)
- **`options`**: Plugin-specific options (see plugin docs)

### How Dynamic Loading Works

The plugin system is **fully dynamic**:

1. **Load config**: System reads `config.json` to see which plugins are needed
2. **Dynamic import**: Only listed plugins are loaded via `import()`
3. **Merge config**: Plugin loads its default `config.json` and merges with user config
4. **Execute**: Plugin runs its logic and returns results
5. **Error handling**: If a plugin fails to load, `❌ plugin-name` appears in statusline

**Example:**

Plugin's default (from `src/plugins/directory/config.json`):
```json
{
  "name": "directory",
  "icon": "📁",
  "color": "blue",
  "options": { "showFullPath": false }
}
```

Your override (in root `config.json`):
```json
{
  "name": "directory",
  "icon": "📂",
  "options": { "showFullPath": true }
}
```

Result after merge:
```json
{
  "name": "directory",
  "icon": "📂",           ← overridden
  "color": "blue",        ← kept from default
  "options": { "showFullPath": true }  ← overridden
}
```

### Available Plugins

#### 📁 [Directory](src/plugins/directory/README.md)

Displays the current directory name or full path.

- **Default:** `📁 statusline`
- **Options:** `showFullPath`, custom icon/color
- **[Full documentation →](src/plugins/directory/README.md)**

#### 🔀 [Git](src/plugins/git/README.md)

Shows Git branch and modification statistics (file count + line changes).

- **Default:** `main !3 +45/-12` (when modified)
- **Options:** `showFileCount`, `showLineStats`, `dirtyColor`
- **[Full documentation →](src/plugins/git/README.md)**

#### ⬢ [Node Version](src/plugins/node-version/README.md)

Displays the current Node.js version.

- **Default:** `⬢ 18.0.0`
- **Options:** `format` (short/full)
- **[Full documentation →](src/plugins/node-version/README.md)**

#### 🔵 [Claude Tokens](src/plugins/claude-tokens/README.md)

Shows Claude Code token usage with count and percentage.

- **Default:** `🔵 59.1k/200k (29.6%)`
- **Options:** `showPercentage`, `showCount`, `format` (compact/full)
- **[Full documentation →](src/plugins/claude-tokens/README.md)**

### Creating Custom Plugins

Want to create your own plugin? See the **[Plugin Development Guide](src/plugins/README.md)** for detailed instructions.

**Key benefits of the dynamic system:**
- 🚀 **No registration needed**: Just drop your plugin in `src/plugins/` folder
- 📝 **Add to config**: Enable it by adding to `config.json`
- 🔄 **Hot-swappable**: Change plugin list without touching source code
- ❌ **Error-safe**: Invalid plugins show `❌` without crashing

### Enabling/Disabling Plugins

**To enable a plugin:** Add it to the `plugins` array in your `config.json`

**To disable a plugin:** Simply remove it from the array (or don't include it)

**Example - only directory and git:**
```json
{
  "plugins": [
    { "name": "directory" },
    { "name": "git" }
  ]
}
```

### Changing Plugin Order

The order in the `plugins` array determines display order:

```json
{
  "plugins": [
    { "name": "git" },        // First
    { "name": "directory" }   // Second
  ]
}
```

**Result:** `main 📁 statusline`

## Rendering Examples

### Default configuration (all plugins enabled)
```
📁 statusline main ⬢ 18.0.0 🔵 59.1k/200k (29.6%)
```

### Directory without Git
```
📁 my-project ⬢ 18.0.0 🔵 45.2k/200k (22.6%)
```

### Directory with Git (no modifications)
```
📁 my-project main ⬢ 18.0.0 🔵 59.1k/200k (29.6%)
```

### Directory with Git (uncommitted modifications)
```
📁 my-project main !3 +45/-12 ⬢ 18.0.0 🔵 59.1k/200k (29.6%)
```
(3 modified files, 45 lines added, 12 lines deleted)

### Minimal configuration (directory + git only)
```
📁 statusline main !3 +45/-12
```

### Custom configuration with separator
With this configuration:
```json
{
  "separator": " | ",
  "plugins": [
    { "name": "directory" },
    { "name": "git" },
    { "name": "claude-tokens", "options": { "showCount": false } }
  ]
}
```

Result:
```
📁 statusline | main !3 +45/-12 | 🔵 29.6%
```

### Color Preview

In your terminal, the statusline will appear with the following colors:
- **Directory**: Bright blue with 📁 icon
- **Git branch**: Green (configurable with `color`)
- **Git modifications**: Yellow `!N +X/-Y` format (configurable with `dirtyColor`)
- **Node version**: Green with ⬢ icon
- **Claude tokens**: Cyan with 🔵 icon

All colors are customizable per-plugin in your `config.json`.

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
│   │   ├── README.md              # 📖 Plugin Development Guide
│   │   ├── directory/
│   │   │   ├── README.md          # 📖 Directory plugin documentation
│   │   │   ├── config.json        # ⭐ Default configuration
│   │   │   └── index.ts           # Directory plugin
│   │   ├── git/
│   │   │   ├── README.md          # 📖 Git plugin documentation
│   │   │   ├── config.json        # ⭐ Default configuration
│   │   │   └── index.ts           # Git plugin
│   │   ├── node-version/
│   │   │   ├── README.md          # 📖 Node version plugin documentation
│   │   │   ├── config.json        # ⭐ Default configuration
│   │   │   └── index.ts           # Node version plugin
│   │   └── claude-tokens/
│   │       ├── README.md          # 📖 Claude tokens plugin documentation
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

Creating your own plugin is straightforward with the dynamic loading system!

**For detailed step-by-step instructions, see the [Plugin Development Guide](src/plugins/README.md).**

**Quick overview:**

1. Create `src/plugins/my-plugin/config.json` with defaults
2. Create `src/plugins/my-plugin/index.ts` with your plugin logic using `export default`
3. Add `{ "name": "my-plugin" }` to your `config.json`
4. Done! The plugin is automatically loaded ✨

**No manual registration needed** - the system dynamically loads plugins from the config!

See the [guide](src/plugins/README.md) for complete examples and best practices!

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
