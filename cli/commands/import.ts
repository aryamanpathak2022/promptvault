import { Command } from "commander";
import { VaultStorage } from "../storage.js";
import { ui } from "../ui.js";

export function registerImport(program: Command): void {
  program
    .command("import")
    .description("Import prompts from a JSON or YAML file")
    .argument("<file>", "File to import from")
    .option("-f, --format <format>", "File format: json, yaml")
    .action((file: string, opts) => {
      try {
        const storage = new VaultStorage();
        const imported = storage.importPrompts(file, opts.format);

        ui.success(`Imported ${imported.length} prompt(s):`);
        for (const p of imported) {
          console.log(`  ${ui.cyan(p.name)}`);
        }
        ui.info(`Stage them with: ${ui.cyan("pv add -A")}`);
      } catch (err: unknown) {
        ui.error((err as Error).message);
        process.exit(1);
      }
    });
}
