import { copyFileSync, existsSync, mkdirSync, readdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const srcPluginsDir = join(__dirname, "../src/plugins");
const distPluginsDir = join(__dirname, "../dist/plugins");

// Create dist/plugins directory if it doesn't exist
if (!existsSync(distPluginsDir)) {
  mkdirSync(distPluginsDir, { recursive: true });
}

// Read all plugin directories
const plugins = readdirSync(srcPluginsDir, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

console.log(`Found ${plugins.length} plugin(s): ${plugins.join(", ")}`);

// Copy each plugin's default.json
let copied = 0;
for (const plugin of plugins) {
  const srcConfigPath = join(srcPluginsDir, plugin, "default.json");
  const distPluginDir = join(distPluginsDir, plugin);
  const distConfigPath = join(distPluginDir, "default.json");

  if (existsSync(srcConfigPath)) {
    // Create plugin directory in dist
    if (!existsSync(distPluginDir)) {
      mkdirSync(distPluginDir, { recursive: true });
    }

    // Copy default.json
    copyFileSync(srcConfigPath, distConfigPath);
    console.log(`✓ Copied ${plugin}/default.json`);
    copied++;
  } else {
    console.warn(`⚠ Warning: ${plugin}/default.json not found, skipping...`);
  }
}

console.log(
  `\n✓ Successfully copied ${copied}/${plugins.length} config file(s)`
);
