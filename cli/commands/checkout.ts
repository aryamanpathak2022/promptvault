import { Command } from "commander";
import { VaultStorage } from "../storage.js";
import { ui } from "../ui.js";

export function registerCheckout(program: Command): void {
  program
    .command("checkout")
    .description("Restore a specific version, tag, or switch to a branch")
    .argument("<ref>", "Commit hash, tag name, or branch name")
    .action((ref: string) => {
      try {
        const storage = new VaultStorage();
        const commit = storage.checkout(ref);

        if (commit) {
          ui.success(`Checked out ${ui.hash(commit.hash)}`);
          ui.keyValue("Message", commit.message);
          ui.keyValue("Files", Object.keys(commit.files).length.toString());
        } else {
          ui.success(`Switched to branch ${ui.green(ref)}`);
        }
      } catch (err: unknown) {
        ui.error((err as Error).message);
        process.exit(1);
      }
    });
}
