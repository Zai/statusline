# Plugin Development Guide

This guide explains how to create custom plugins for the Claude Code statusline.

## Plugin Architecture

The statusline uses a **dynamic plugin loading system**. Plugins are automatically loaded from the `config.json` file - no manual registration required!

Each plugin is **autonomous** and follows this structure:

```
src/plugins/my-plugin/
├── index.ts        # Plugin implementation (must use export default)
├── default.json    # Default configuration
└── README.md       # Plugin documentation
```

**Key concepts:**
- 🚀 **Dynamic loading**: Plugins are loaded on-demand via `import()`
- 📦 **Export default**: All plugins must use `export default`
- ⚙️ **Auto-discovery**: Just add plugin name to config and it loads automatically
- ❌ **Error handling**: Failed plugins show `❌ plugin-name` in statusline

## Creating a New Plugin

### 1. Create the Plugin Directory

```bash
mkdir -p src/plugins/my-plugin
```

### 2. Create the Default Configuration (`default.json`)

```json
{
  "name": "my-plugin",
  "prefix": "🔧",
  "color": "cyan",
  "options": {
    "myOption": true
  }
}
```

**Important:** Do NOT include `enabled` or `order` fields. These are managed by the root configuration.

### 3. Implement the Plugin (`index.ts`)

**IMPORTANT:** Use `export default` for the plugin object!

```typescript
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Plugin, PluginContext, PluginConfig, PluginResult } from '../../types/plugin.js';
import { colors } from '../../lib/constant.js';
import { deepMerge } from '../../lib/merge.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface MyPluginOptions {
  myOption?: boolean;
}

// Load default config
const defaultConfig: PluginConfig = JSON.parse(
  readFileSync(join(__dirname, 'default.json'), 'utf-8')
);

// Use export default (required for dynamic loading)
export default {
  name: 'my-plugin',

  execute(context: PluginContext, userConfig: PluginConfig): PluginResult {
    try {
      // IMPORTANT: Use deepMerge instead of spread operator!
      // deepMerge properly merges nested objects like 'options'
      const config = deepMerge(defaultConfig, userConfig);

      // Use values from merged config (no hardcoded defaults!)
      const prefix = config.prefix;
      const color = config.color;
      const colorCode = colors[color as keyof typeof colors] || colors.cyan;

      // Plugin-specific options
      const options = config.options as MyPluginOptions | undefined;
      const myOption = options?.myOption;

      // Your plugin logic here
      const content = `${colorCode}${prefix} My Content${colors.reset}`;

      return { content };
    } catch (error) {
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error in my-plugin',
      };
    }
  },
} as Plugin;
```

### 4. Enable Your Plugin

**No registration needed!** Simply add your plugin to `config.json`:

```json
{
  "plugins": [
    {
      "name": "my-plugin"
    }
  ]
}
```

The plugin will be **automatically loaded** when the statusline starts! ✨

**How it works:**
1. PluginManager reads `config.json`
2. Sees `"my-plugin"` in the list
3. Dynamically imports from `src/plugins/my-plugin/index.js`
4. Validates the plugin structure
5. Registers and executes it

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
  prefix?: string;
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

1. **Default config** is loaded from `default.json`
2. **User config** is passed via `execute(context, userConfig)`
3. **Deep merge** happens inside the plugin: `deepMerge(defaultConfig, userConfig)`

**⚠️ IMPORTANT: Always use `deepMerge` instead of spread operator!**

The spread operator (`{ ...defaultConfig, ...userConfig }`) only does a **shallow merge**, which means nested objects like `options` will be completely replaced instead of merged.

**❌ Wrong (shallow merge):**
```typescript
const config = { ...defaultConfig, ...userConfig };
// If userConfig.options exists, it REPLACES defaultConfig.options entirely!
```

**✅ Correct (deep merge):**
```typescript
import { deepMerge } from '../../lib/merge.js';
const config = deepMerge(defaultConfig, userConfig);
// Nested objects are properly merged recursively
```

**Example:**

```typescript
// Plugin's default.json
{
  "name": "my-plugin",
  "prefix": "🔧",
  "color": "cyan",
  "options": {
    "myOption": true,
    "anotherOption": "default"
  }
}

// User's config.json (root)
{
  "plugins": [
    {
      "name": "my-plugin",
      "prefix": "⚙️",
      "options": {
        "myOption": false
      }
    }
  ]
}

// With deepMerge (✅ correct result)
{
  "name": "my-plugin",
  "prefix": "⚙️",                    // overridden
  "color": "cyan",                    // kept from default
  "options": {
    "myOption": false,                // overridden
    "anotherOption": "default"        // kept from default!
  }
}

// With spread operator (❌ wrong result)
{
  "name": "my-plugin",
  "prefix": "⚙️",                    // overridden
  "color": "cyan",                    // kept from default
  "options": {
    "myOption": false                 // only this!
    // anotherOption is LOST! ❌
  }
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

### 3. Always Use deepMerge!

**⚠️ CRITICAL:** Always use `deepMerge` to merge configurations, never the spread operator!

**❌ Bad (shallow merge):**
```typescript
const config = { ...defaultConfig, ...userConfig };  // NO! Breaks nested options
```

**✅ Good (deep merge):**
```typescript
import { deepMerge } from '../../lib/merge.js';
const config = deepMerge(defaultConfig, userConfig);  // YES! Properly merges nested objects
```

**Why?** The spread operator only does a shallow merge. If `userConfig.options` exists, it will completely replace `defaultConfig.options`, losing all default option values that weren't overridden.

### 4. No Hardcoded Defaults!

**IMPORTANT:** All default values must be in `default.json`, not in code!

**❌ Bad (hardcoded defaults):**
```typescript
const prefix = config.prefix || '🔧';         // NO!
const color = config.color || 'cyan';         // NO!
const myOption = options?.myOption ?? true;   // NO!
```

**✅ Good (defaults from default.json):**
```typescript
// Deep merge happens at the top of execute()
const config = deepMerge(defaultConfig, userConfig);

// Then just use the values directly
const prefix = config.prefix;
const color = config.color;
const myOption = options?.myOption;
```

After the merge, all values are guaranteed to exist from `defaultConfig` (loaded from `default.json`). Only use fallbacks for type safety (e.g., `colors[color as keyof typeof colors] || colors.cyan`).

### 5. Use ANSI Color Codes

Use the `colors` constant for consistent styling:

```typescript
import { colors } from '../../lib/constant.js';

const content = `${colors.cyan}${icon} Text${colors.reset}`;
```

Available colors: `reset`, `bright`, `dim`, `cyan`, `blue`, `green`, `yellow`, `magenta`, `gray`, `red`

### 6. Keep Performance in Mind

- Avoid expensive operations in `execute()`
- Cache results when possible
- Use `stdio: ['pipe', 'pipe', 'ignore']` when calling child processes

### 7. Document Your Plugin

Create a `README.md` in your plugin directory documenting:
- What the plugin does
- Configuration options
- Examples

## Plugin Lifecycle

1. **User Config Load**: User's `config.json` is loaded
2. **Dynamic Loading**: PluginManager dynamically imports each plugin listed in config:
   - Reads plugin name from config array
   - Calls `import(\`../plugins/${name}/index.js\`)`
   - Validates plugin structure (must have `name` and `execute`)
   - Registers plugin in internal Map
   - On error: stores error and displays `❌ plugin-name` in statusline
3. **Execution**: For each registered plugin (in order):
   - Plugin receives `context` and `userConfig`
   - Plugin loads its `default.json` (default config)
   - Plugin merges configs: `deepMerge(defaultConfig, userConfig)`
   - Plugin executes its logic
   - Plugin returns `PluginResult`
4. **Assembly**: Results are joined with separator

**Key advantage:** Only plugins in the config are loaded - no wasted memory or imports!

## Examples

See existing plugins for reference:
- [directory](./directory/README.md) - Simple plugin with one option
- [git](./git/README.md) - Plugin with git command execution
- [node-version](./node-version/README.md) - Simple plugin reading process info
- [claude-tokens](./claude-tokens/README.md) - Complex plugin with file parsing
