import { Command } from "commander";
import { VaultStorage } from "../storage.js";
import { ui } from "../ui.js";
import pc from "picocolors";

export function registerBranch(program: Command): void {
  program
    .command("branch")
    .description("List, create, or delete branches")
    .argument("[name]", "Branch name to create")
    .option("-d, --delete <name>", "Delete a branch")
    .action((name?: string, opts?: { delete?: string }) => {
      try {
        const storage = new VaultStorage();
        storage.assertInitialized();

        if (opts?.delete) {
          storage.deleteBranch(opts.delete);
          ui.success(`Deleted branch ${ui.cyan(opts.delete)}`);
          return;
        }

        if (name) {
          storage.createBranch(name);
          ui.success(`Created branch ${ui.cyan(name)}`);
          ui.info(`Switch to it with: ${ui.cyan(`pv checkout ${name}`)}`);
          return;
        }

        // List branches
        const branches = storage.getBranches();
        const current = storage.getCurrentBranch();

        if (branches.length === 0) {
          // Show current even if no ref file exists
          console.log(pc.green("* " + current));
          return;
        }

        // Ensure current branch is in list
        const allBranches = new Set([current, ...branches]);
        for (const b of allBranches) {
          if (b === current) {
            console.log(pc.green("* " + b));
          } else {
            console.log("  " + b);
          }
        }
      } catch (err: unknown) {
        ui.error((err as Error).message);
        process.exit(1);
      }
    });
}
