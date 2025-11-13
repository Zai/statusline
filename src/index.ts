import { writeFileSync } from "fs";
import path from "path";
import { colors } from "./lib/constant.js";
import { PluginManager } from "./lib/plugin-manager.js";
import { ClaudeCodeInput, PluginContext } from "./types/plugin.js";

async function main(): Promise<void> {
  try {
    // Read JSON data from stdin
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    const input = Buffer.concat(chunks).toString();
    const data: ClaudeCodeInput = JSON.parse(input);

    // Save example input if SAVE_INPUT is set
    if (process.env.SAVE_INPUT) {
      try {
        writeFileSync(
          "fixtures/example-input.json",
          JSON.stringify(data, null, 2)
        );
      } catch (e) {
        // Ignore save errors
      }
    }

    // Prepare context for plugins
    const currentDir = data.workspace?.current_dir || process.cwd();
    const dirName = path.basename(currentDir);

    const context: PluginContext = {
      input: data,
      currentDir,
      dirName,
    };

    // Initialize plugin manager and execute plugins
    const pluginManager = new PluginManager();
    const statusLine = await pluginManager.execute(context);

    // Display statusline
    console.log(statusLine);
  } catch (error) {
    // On error, display basic statusline
    console.log(
      `${colors.blue}📁 ${path.basename(process.cwd())}${colors.reset}`
    );

    // Log error in DEBUG mode
    if (process.env.DEBUG) {
      console.error(
        "Error:",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
}

main();
