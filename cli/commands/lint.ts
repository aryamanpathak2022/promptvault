import { Command } from "commander";
import { VaultStorage } from "../storage.js";
import { ui } from "../ui.js";
import * as fs from "fs";

export function registerLint(program: Command): void {
  program
    .command("lint")
    .description("Check prompts for common issues")
    .argument("[name]", "Specific prompt to lint (lints all if omitted)")
    .action((name?: string) => {
      try {
        const storage = new VaultStorage();
        let prompts: Array<{ name: string; content: string }>;

        if (name) {
          const p = storage.getPrompt(name);
          if (!p) {
            // Try as file path
            if (fs.existsSync(name)) {
              prompts = [{ name, content: fs.readFileSync(name, "utf-8") }];
            } else {
              ui.error(`Prompt '${name}' not found.`);
              process.exit(1);
              return;
            }
          } else {
            prompts = [p];
          }
        } else {
          prompts = storage.listPrompts();
        }

        if (prompts.length === 0) {
          ui.info("No prompts to lint.");
          return;
        }

        let totalIssues = 0;
        for (const p of prompts) {
          const issues = storage.lintPrompt(p.content);

          if (issues.length > 0) {
            console.log(`\n  ${ui.bold(p.name)}:`);
            for (const issue of issues) {
              console.log(`    ${ui.lintLevel(issue.level)}  ${issue.message}`);
              totalIssues++;
            }
          }
        }

        if (totalIssues === 0) {
          ui.success("All prompts look good!");
        } else {
          console.log(`\n  ${totalIssues} issue(s) found across ${prompts.length} prompt(s).`);
        }
      } catch (err: unknown) {
        ui.error((err as Error).message);
        process.exit(1);
      }
    });
}
