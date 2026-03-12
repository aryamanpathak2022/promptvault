import { Command } from "commander";
import { VaultStorage } from "../storage.js";
import { ui } from "../ui.js";
import pc from "picocolors";

export function registerLog(program: Command): void {
  program
    .command("log")
    .description("Show commit history")
    .option("-n, --count <n>", "Number of commits to show", "20")
    .option("-b, --branch <name>", "Show log for a specific branch")
    .option("--oneline", "Show compact one-line format")
    .action((opts) => {
      try {
        const storage = new VaultStorage();
        const commits = storage.getLog(opts.branch);
        const limit = parseInt(opts.count, 10);

        if (commits.length === 0) {
          ui.info("No commits yet.");
          return;
        }

        const shown = commits.slice(0, limit);

        for (const commit of shown) {
          if (opts.oneline) {
            const tags = storage.getTags().filter((t) => t.hash === commit.hash);
            const tagStr = tags.length
              ? " " + tags.map((t) => pc.yellow(`(tag: ${t.name})`)).join(" ")
              : "";
            console.log(
              `${ui.hash(commit.hash)} ${commit.message}${tagStr}`
            );
          } else {
            console.log(
              pc.yellow("commit " + commit.hash) +
                (commit.branch ? pc.green(` (${commit.branch})`) : "")
            );
            console.log("Author: " + commit.author);
            console.log(
              "Date:   " + new Date(commit.timestamp).toLocaleString()
            );

            // Show tags
            const tags = storage.getTags().filter((t) => t.hash === commit.hash);
            if (tags.length > 0) {
              console.log(
                "Tags:   " +
                  tags.map((t) => pc.yellow(t.name)).join(", ")
              );
            }

            console.log("\n    " + commit.message);
            console.log(
              pc.dim(
                `    (${Object.keys(commit.files).length} file(s))`
              )
            );
            console.log();
          }
        }

        if (commits.length > limit) {
          ui.dim(`... and ${commits.length - limit} more commits`);
        }
      } catch (err: unknown) {
        ui.error((err as Error).message);
        process.exit(1);
      }
    });
}
