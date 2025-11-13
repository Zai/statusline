# Plugin Development Guide

This guide explains how to create custom plugins for the Claude Code statusline.

## Plugin Architecture

Each plugin is **autonomous** and follows this structure:

```
src/plugins/my-plugin/
├── index.ts        # Plugin implementation
├── config.json     # Default configuration
└── README.md       # Plugin documentation
```

## Creating a New Plugin

### 1. Create the Plugin Directory

```bash
mkdir -p src/plugins/my-plugin
```

### 2. Create the Default Configuration (`config.json`)

```json
{
  "name": "my-plugin",
  "icon": "🔧",
  "color": "cyan",
  "options": {
    "myOption": true
  }
}
```

**Important:** Do NOT include `enabled` or `order` fields. These are managed by the root configuration.

### 3. Implement the Plugin (`index.ts`)

```typescript
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Plugin, PluginContext, PluginConfig, PluginResult } from '../../types/plugin.js';
import { colors } from '../../lib/constant.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface MyPluginOptions {
  myOption?: boolean;
}

// Load default config
const defaultConfig: PluginConfig = JSON.parse(
  readFileSync(join(__dirname, 'config.json'), 'utf-8')
);

export const myPlugin: Plugin = {
  name: 'my-plugin',

  execute(context: PluginContext, userConfig: PluginConfig): PluginResult {
    try {
      // Merge default config with user config
      const config = { ...defaultConfig, ...userConfig };

      // Use values from merged config (no hardcoded defaults!)
      const icon = config.icon;
      const color = config.color;
      const colorCode = colors[color as keyof typeof colors] || colors.cyan;

      // Plugin-specific options
      const options = config.options as MyPluginOptions | undefined;
      const myOption = options?.myOption;

      // Your plugin logic here
      const content = `${colorCode}${icon} My Content${colors.reset}`;

      return { content };
    } catch (error) {
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error in my-plugin',
      };
    }
  },
};
```

### 4. Register the Plugin

In `src/lib/plugin-manager.ts`:

```typescript
import { myPlugin } from '../plugins/my-plugin/index.js';

// Inside constructor
this.registerPlugin(myPlugin);
```

### 5. Add to User Configuration

Users enable your plugin by adding it to their `config.json`:

```json
{
  "plugins": [
    {
      "name": "my-plugin"
    }
  ]
}
```

The order in the array determines display order.

## Plugin Interface

### `Plugin`

```typescript
interface Plugin {
  name: string;
  execute(context: PluginContext, config: PluginConfig): Promise<PluginResult> | PluginResult;
}
```

### `PluginContext`

Provides information about the current Claude Code session:

```typescript
interface PluginContext {
  input: ClaudeCodeInput;  // Claude Code input data
  currentDir: string;       // Current directory path
  dirName: string;          // Current directory name
}
```

### `PluginConfig`

User-provided configuration for the plugin:

```typescript
interface PluginConfig {
  name: string;
  icon?: string;
  color?: string;
  options?: PluginOptions;  // Plugin-specific options
}
```

### `PluginResult`

The result returned by your plugin:

```typescript
interface PluginResult {
  content: string;  // Display text (can be empty)
  error?: string;   // Optional error message
}
```

## Configuration Merging

Plugins are **autonomous** and handle their own configuration merging:

1. **Default config** is loaded from `config.json`
2. **User config** is passed via `execute(context, userConfig)`
3. **Merge** happens inside the plugin: `{ ...defaultConfig, ...userConfig }`

Example:

```typescript
// Plugin's config.json (default)
{
  "name": "my-plugin",
  "icon": "🔧",
  "color": "cyan",
  "options": { "myOption": true }
}

// User's config.json
{
  "plugins": [
    {
      "name": "my-plugin",
      "icon": "⚙️",
      "options": { "myOption": false }
    }
  ]
}

// Merged result inside plugin
{
  "name": "my-plugin",
  "icon": "⚙️",        // overridden
  "color": "cyan",      // kept from default
  "options": { "myOption": false }  // overridden
}
```

## Best Practices

### 1. Always Handle Errors

```typescript
try {
  // Your logic
  return { content: '...' };
} catch (error) {
  return {
    content: '',
    error: error instanceof Error ? error.message : 'Unknown error',
  };
}
```

### 2. Return Empty Content When Appropriate

If the plugin has nothing to display, return empty content:

```typescript
if (!data) {
  return { content: '' };
}
```

### 3. No Hardcoded Defaults!

**IMPORTANT:** All default values must be in `config.json`, not in code!

**❌ Bad (hardcoded defaults):**
```typescript
const icon = config.icon || '🔧';           // NO!
const color = config.color || 'cyan';       // NO!
const myOption = options?.myOption ?? true; // NO!
```

**✅ Good (defaults from config.json):**
```typescript
// Merge happens at the top of execute()
const config = { ...defaultConfig, ...userConfig };

// Then just use the values directly
const icon = config.icon;
const color = config.color;
const myOption = options?.myOption;
```

After the merge, all values are guaranteed to exist from `defaultConfig`. Only use fallbacks for type safety (e.g., `colors[color as keyof typeof colors] || colors.cyan`).

### 4. Use ANSI Color Codes

Use the `colors` constant for consistent styling:

```typescript
import { colors } from '../../lib/constant.js';

const content = `${colors.cyan}${icon} Text${colors.reset}`;
```

Available colors: `reset`, `bright`, `dim`, `cyan`, `blue`, `green`, `yellow`, `magenta`, `gray`, `red`

### 5. Keep Performance in Mind

- Avoid expensive operations in `execute()`
- Cache results when possible
- Use `stdio: ['pipe', 'pipe', 'ignore']` when calling child processes

### 6. Document Your Plugin

Create a `README.md` in your plugin directory documenting:
- What the plugin does
- Configuration options
- Examples

## Plugin Lifecycle

1. **Registration**: Plugin is registered in `PluginManager` constructor
2. **User Config Load**: User's `config.json` is loaded
3. **Execution**: For each plugin in user's config array (in order):
   - Plugin receives `context` and `userConfig`
   - Plugin loads its `config.json` (default config)
   - Plugin merges configs: `{ ...defaultConfig, ...userConfig }`
   - Plugin executes its logic
   - Plugin returns `PluginResult`
4. **Assembly**: Results are joined with separator

## Examples

See existing plugins for reference:
- [directory](./directory/README.md) - Simple plugin with one option
- [git](./git/README.md) - Plugin with git command execution
- [node-version](./node-version/README.md) - Simple plugin reading process info
- [claude-tokens](./claude-tokens/README.md) - Complex plugin with file parsing
