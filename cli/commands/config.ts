import { Command } from "commander";
import { VaultStorage } from "../storage.js";
import { ui } from "../ui.js";

export function registerConfig(program: Command): void {
  program
    .command("config")
    .description("View or update vault configuration")
    .argument("[key]", "Config key to get or set")
    .argument("[value]", "Value to set")
    .action((key?: string, value?: string) => {
      try {
        const storage = new VaultStorage();
        const config = storage.getConfig();

        if (!key) {
          // Show all config
          ui.header("Vault Configuration");
          ui.keyValue("author", config.author || "(not set)", 15);
          ui.keyValue("email", config.email || "(not set)", 15);
          ui.keyValue("defaultModel", config.defaultModel || "(not set)", 15);
          ui.keyValue("created", config.createdAt, 15);

          if (config.remotes && Object.keys(config.remotes).length > 0) {
            console.log("\n  Remotes:");
            for (const [name, url] of Object.entries(config.remotes)) {
              ui.keyValue(`  ${name}`, url, 15);
            }
          }
          return;
        }

        if (!value) {
          // Get single value
          const val = (config as unknown as Record<string, unknown>)[key];
          if (val !== undefined) {
            console.log(String(val));
          } else {
            ui.error(`Unknown config key: ${key}`);
            process.exit(1);
          }
          return;
        }

        // Set value
        const allowed = ["author", "email", "defaultModel"];
        if (!allowed.includes(key)) {
          ui.error(`Cannot set '${key}'. Allowed keys: ${allowed.join(", ")}`);
          process.exit(1);
        }

        storage.setConfig({ [key]: value });
        ui.success(`Set ${ui.cyan(key)} = ${value}`);
      } catch (err: unknown) {
        ui.error((err as Error).message);
        process.exit(1);
      }
    });
}
