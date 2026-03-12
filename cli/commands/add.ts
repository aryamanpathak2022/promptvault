import { Command } from "commander";
import { VaultStorage } from "../storage.js";
import { ui } from "../ui.js";
import * as fs from "fs";
import * as path from "path";

export function registerAdd(program: Command): void {
  program
    .command("add")
    .description("Stage prompt files for the next commit")
    .argument("<files...>", "Files to stage (supports globs)")
    .option("-A, --all", "Stage all prompt files in the current directory")
    .action((files: string[], opts) => {
      try {
        const storage = new VaultStorage();
        storage.assertInitialized();

        let filesToStage: string[] = files;

        if (opts.all) {
          filesToStage = storage.findPromptFiles();
          if (filesToStage.length === 0) {
            ui.warn("No prompt files found to stage.");
            return;
          }
        }

        let count = 0;
        for (const file of filesToStage) {
          try {
            const entry = storage.stageFile(file);
            ui.success(`Staged ${ui.cyan(entry.name)} (${ui.dim(entry.filePath)})`);
            count++;
          } catch (err: unknown) {
            ui.error((err as Error).message);
          }
        }

        if (count > 0) {
          ui.info(`${count} file(s) staged. Run ${ui.cyan("pv commit -m \"message\"")} to commit.`);
        }
      } catch (err: unknown) {
        ui.error((err as Error).message);
        process.exit(1);
      }
    });
}
