import { Command } from "commander";
import { VaultStorage } from "../storage.js";
import { ui } from "../ui.js";

export function registerReset(program: Command): void {
  program
    .command("reset")
    .description("Unstage changes or reset to a previous version")
    .argument("[ref]", "Commit hash to reset to")
    .option("--hard", "Hard reset (discard all changes)")
    .option("-f, --file <name>", "Unstage a specific file")
    .action((ref?: string, opts?: { hard?: boolean; file?: string }) => {
      try {
        const storage = new VaultStorage();

        if (opts?.file) {
          storage.unstageFile(opts.file);
          ui.success(`Unstaged ${ui.cyan(opts.file)}`);
          return;
        }

        const mode = opts?.hard ? "hard" : "soft";
        storage.reset(mode, ref);

        if (mode === "hard") {
          ui.success("Hard reset complete. Working directory restored.");
        } else {
          ui.success("Staging area cleared.");
        }
      } catch (err: unknown) {
        ui.error((err as Error).message);
        process.exit(1);
      }
    });
}
