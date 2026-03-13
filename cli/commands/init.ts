import { Command } from "commander";
import { VaultStorage } from "../storage.js";
import { ui } from "../ui.js";

export function registerInit(program: Command): void {
  program
    .command("init")
    .description("Initialize a new prompt vault in the current directory")
    .option("-a, --author <name>", "Author name")
    .option("-e, --email <email>", "Author email")
    .action((opts) => {
      try {
        const storage = new VaultStorage(process.cwd());
        storage.init(opts.author, opts.email);
        ui.success("Initialized empty prompt vault in " + ui.bold(".promptvault/"));
        ui.info("Start by adding prompt files: " + ui.cyan("pv add <file>"));
      } catch (err: unknown) {
        ui.error((err as Error).message);
        process.exit(1);
      }
    });
}
