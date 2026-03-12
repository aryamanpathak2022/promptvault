import { Command } from "commander";
import { VaultStorage } from "../storage.js";
import { ui } from "../ui.js";

export function registerCommit(program: Command): void {
  program
    .command("commit")
    .description("Commit staged prompt changes")
    .requiredOption("-m, --message <message>", "Commit message")
    .action((opts) => {
      try {
        const storage = new VaultStorage();
        const commit = storage.commit(opts.message);

        ui.success(
          `Committed ${ui.hash(commit.hash)} on ${ui.green(commit.branch)}`
        );
        ui.keyValue("Message", commit.message);
        ui.keyValue("Author", commit.author);
        ui.keyValue("Files", Object.keys(commit.files).length.toString());
        ui.keyValue("Time", new Date(commit.timestamp).toLocaleString());
      } catch (err: unknown) {
        ui.error((err as Error).message);
        process.exit(1);
      }
    });
}
