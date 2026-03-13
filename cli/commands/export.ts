import { Command } from "commander";
import { VaultStorage } from "../storage.js";
import { ui } from "../ui.js";
import * as fs from "fs";

export function registerExport(program: Command): void {
  program
    .command("export")
    .description("Export prompts to a file")
    .option("-f, --format <format>", "Output format: json, yaml, markdown", "json")
    .option("-o, --output <file>", "Output file path")
    .action((opts) => {
      try {
        const storage = new VaultStorage();
        const format = opts.format as "json" | "yaml" | "markdown";
        const output = storage.exportPrompts(format);

        if (opts.output) {
          fs.writeFileSync(opts.output, output, "utf-8");
          ui.success(`Exported to ${ui.cyan(opts.output)}`);
        } else {
          process.stdout.write(output);
        }
      } catch (err: unknown) {
        ui.error((err as Error).message);
        process.exit(1);
      }
    });
}
