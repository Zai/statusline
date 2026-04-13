# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claude Code Statusline — a modular, plugin-based statusline for Claude Code's terminal/IDE status area. Reads JSON from stdin (provided by Claude Code), runs plugins, and outputs ANSI-colored text to stdout. Zero runtime dependencies; only needs Node.js >=18.

## Commands

```bash
pnpm dev              # Run directly via tsx (no build needed)
pnpm build            # TypeScript compile + copy plugin default.json files to dist/
pnpm watch            # TypeScript watch mode
pnpm clean            # Remove dist/
SAVE_INPUT=1 pnpm dev # Capture stdin JSON to fixtures/example-input.json for debugging
```

No test framework is configured. To test manually: `echo '{}' | pnpm dev` or `echo '{}' | node dist/index.js`.

## Architecture

**Data flow:** stdin JSON → `index.ts` → `PluginManager` → plugins execute → joined output string

### Plugin System

Plugins live in `src/plugins/{name}/` with this structure:
- `index.ts` — exports default a `Plugin` object with `name` and `execute(context, config)`
- `default.json` — default configuration (merged with user config via `deepMerge`)

Plugins are loaded dynamically via `import()` based on the `config.json` plugins array. The PluginManager handles loading, config merging, execution, and error containment (failed plugins show `❌ plugin-name` instead of crashing).

### Configuration

User config is in `config.json` at project root (optional). Structure:
```json
{
  "separator": " | ",
  "plugins": [
    { "name": "directory", "prefix": "📁", "color": "blue", "options": { "showFullPath": false } }
  ]
}
```

Each plugin's `default.json` is deep-merged with user config. Use `deepMerge()` from `src/lib/merge.ts` — never shallow spread — to preserve nested `options`.

### Key Types (src/types/plugin.ts)

- `ClaudeCodeInput` — full JSON input from Claude Code (session_id, transcript_path, cwd, workspace, model, version, cost, etc.)
- `PluginContext` — `{ input, currentDir, dirName }` passed to each plugin
- `PluginConfig` — `{ name, prefix?, color?, options? }`
- `Plugin` — `{ name, execute(context, config) → PluginResult }`

### Key Modules

- `src/lib/plugin-manager.ts` — orchestrates plugin loading, config merging, execution
- `src/lib/constant.ts` — ANSI color codes
- `src/lib/merge.ts` — `deepMerge<T>()` utility
- `scripts/copy-plugin-default-configs.js` — post-build script copying default.json files to dist/

## Creating a Plugin

1. Create `src/plugins/{name}/index.ts` with `export default { name, execute }` matching the `Plugin` interface
2. Create `src/plugins/{name}/default.json` with default config
3. Add plugin entry to `config.json` to enable it
4. No registration code needed — dynamic loading handles discovery

## Build Notes

- ESM throughout (module: ES2022, target: ES2022)
- `resolveJsonModule: true` — plugins import their own `default.json`
- Build copies `default.json` files from src to dist via `scripts/copy-plugin-default-configs.js`
- Integration with Claude Code: configured in `.claude/settings.json` as `node dist/index.js` statusLine command
