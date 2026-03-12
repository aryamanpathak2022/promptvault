import { Command } from "commander";
import { VaultStorage } from "../storage.js";
import { ui } from "../ui.js";
import pc from "picocolors";

export function registerList(program: Command): void {
  program
    .command("list")
    .alias("ls")
    .description("List all tracked prompts")
    .option("-l, --long", "Show detailed information")
    .action((opts) => {
      try {
        const storage = new VaultStorage();
        const prompts = storage.listPrompts();

        if (prompts.length === 0) {
          ui.info("No prompts tracked yet.");
          ui.info("Add files with: " + ui.cyan("pv add <file>"));
          return;
        }

        if (opts.long) {
          ui.header(`Tracked Prompts (${prompts.length})`);
          for (const p of prompts) {
            const tokens = Math.ceil(p.content.length / 4);
            const lines = p.content.split("\n").length;
            console.log(pc.bold(p.name));
            ui.keyValue("  Lines", lines.toString());
            ui.keyValue("  Tokens", `~${tokens}`);
            ui.keyValue("  Preview", p.content.split("\n")[0].slice(0, 60) + (p.content.length > 60 ? "..." : ""));
            console.log();
          }
        } else {
          for (const p of prompts) {
            const preview = p.content.split("\n")[0].slice(0, 50);
            console.log(
              `  ${pc.cyan(p.name.padEnd(25))} ${pc.dim(preview)}${preview.length >= 50 ? "..." : ""}`
            );
          }
        }

        console.log(pc.dim(`\n  ${prompts.length} prompt(s) tracked`));
      } catch (err: unknown) {
        ui.error((err as Error).message);
        process.exit(1);
      }
    });
}
