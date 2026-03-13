import { Command } from "commander";
import { VaultStorage } from "../storage.js";
import { ui } from "../ui.js";
import pc from "picocolors";

export function registerShow(program: Command): void {
  program
    .command("show")
    .description("Display a prompt's content")
    .argument("<name>", "Prompt name")
    .option("--raw", "Output raw content without formatting")
    .action((name: string, opts) => {
      try {
        const storage = new VaultStorage();
        const prompt = storage.getPrompt(name);

        if (!prompt) {
          ui.error(`Prompt '${name}' not found.`);
          const prompts = storage.listPrompts();
          if (prompts.length > 0) {
            ui.info("Available prompts: " + prompts.map((p) => ui.cyan(p.name)).join(", "));
          }
          process.exit(1);
        }

        if (opts.raw) {
          process.stdout.write(prompt.content);
          return;
        }

        console.log(pc.bold(pc.cyan(`── ${prompt.name} ──`)));
        console.log();
        console.log(prompt.content);
        console.log();

        const tokens = Math.ceil(prompt.content.length / 4);
        const lines = prompt.content.split("\n").length;
        console.log(
          pc.dim(`${lines} lines · ~${tokens} tokens · ${prompt.content.length} chars`)
        );
      } catch (err: unknown) {
        ui.error((err as Error).message);
        process.exit(1);
      }
    });
}
