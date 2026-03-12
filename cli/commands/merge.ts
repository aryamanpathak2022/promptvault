import { Command } from "commander";
import { VaultStorage } from "../storage.js";
import { ui } from "../ui.js";

export function registerMerge(program: Command): void {
  program
    .command("merge")
    .description("Merge a branch into the current branch")
    .argument("<branch>", "Branch to merge from")
    .action((branch: string) => {
      try {
        const storage = new VaultStorage();
        const result = storage.merge(branch);

        if (result.success) {
          ui.success(result.message);
        } else {
          ui.warn(result.message);
          if (result.conflicts) {
            for (const conflict of result.conflicts) {
              ui.warn(`  Conflict in: ${ui.cyan(conflict.fileName)}`);
            }
          }
        }
      } catch (err: unknown) {
        ui.error((err as Error).message);
        process.exit(1);
      }
    });
}
