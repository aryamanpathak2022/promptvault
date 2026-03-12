import { Command } from "commander";
import { VaultStorage } from "../storage.js";
import { ui } from "../ui.js";
import pc from "picocolors";

export function registerDiff(program: Command): void {
  program
    .command("diff")
    .description("Show differences between versions")
    .argument("[ref1]", "First commit hash (optional)")
    .argument("[ref2]", "Second commit hash (optional)")
    .action((ref1?: string, ref2?: string) => {
      try {
        const storage = new VaultStorage();
        const results = storage.diff(ref1, ref2);

        if (results.length === 0) {
          ui.info("No differences found.");
          return;
        }

        for (const result of results) {
          console.log(
            pc.bold("--- " + result.fileName) +
              "  " +
              pc.green(`+${result.additions}`) +
              " " +
              pc.red(`-${result.deletions}`)
          );

          for (const hunk of result.hunks) {
            const lines = hunk.value.split("\n").filter(Boolean);
            for (const line of lines) {
              if (hunk.type === "added") {
                console.log(pc.green("+ " + line));
              } else if (hunk.type === "removed") {
                console.log(pc.red("- " + line));
              } else {
                console.log(pc.dim("  " + line));
              }
            }
          }
          console.log();
        }
      } catch (err: unknown) {
        ui.error((err as Error).message);
        process.exit(1);
      }
    });
}
