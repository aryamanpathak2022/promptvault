import { Command } from "commander";
import { VaultStorage } from "../storage.js";
import { ui } from "../ui.js";
import pc from "picocolors";

export function registerStatus(program: Command): void {
  program
    .command("status")
    .description("Show the current vault status")
    .action(() => {
      try {
        const storage = new VaultStorage();
        const status = storage.status();

        console.log(`On branch ${pc.green(status.branch)}`);

        const head = storage.getBranchHead(status.branch);
        if (!head) {
          console.log(pc.dim("\nNo commits yet.\n"));
        }

        if (status.staged.length > 0) {
          console.log(
            pc.bold("\nChanges staged for commit:")
          );
          console.log(pc.dim('  (use "pv reset" to unstage)\n'));
          for (const file of status.staged) {
            console.log("  " + pc.green("staged:   ") + file.name);
          }
        }

        if (status.modified.length > 0) {
          console.log(
            pc.bold("\nModified files (not staged):")
          );
          console.log(pc.dim('  (use "pv add <file>" to stage)\n'));
          for (const name of status.modified) {
            console.log("  " + pc.yellow("modified: ") + name);
          }
        }

        if (status.untracked.length > 0) {
          console.log(pc.bold("\nUntracked files:"));
          console.log(pc.dim('  (use "pv add <file>" to track)\n'));
          for (const name of status.untracked) {
            console.log("  " + pc.red("untracked: ") + name);
          }
        }

        if (
          status.staged.length === 0 &&
          status.modified.length === 0 &&
          status.untracked.length === 0 &&
          head
        ) {
          ui.success("Working directory clean.");
        }
      } catch (err: unknown) {
        ui.error((err as Error).message);
        process.exit(1);
      }
    });
}
