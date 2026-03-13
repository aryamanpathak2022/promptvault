import { Command } from "commander";
import { VaultStorage } from "../storage.js";
import { ui } from "../ui.js";
import pc from "picocolors";

export function registerSearch(program: Command): void {
  program
    .command("search")
    .description("Search through prompts by name or content")
    .argument("<query>", "Search query")
    .action((query: string) => {
      try {
        const storage = new VaultStorage();
        const results = storage.searchPrompts(query);

        if (results.length === 0) {
          ui.info(`No prompts matching '${query}'.`);
          return;
        }

        ui.header(`Search results for '${query}' (${results.length})`);

        for (const p of results) {
          const preview = p.content.split("\n")[0].slice(0, 60);
          console.log(`  ${pc.cyan(p.name)}`);

          // Highlight matching lines
          const lines = p.content.split("\n");
          const lowerQuery = query.toLowerCase();
          let shown = 0;
          for (const line of lines) {
            if (line.toLowerCase().includes(lowerQuery) && shown < 3) {
              const idx = line.toLowerCase().indexOf(lowerQuery);
              const before = line.slice(0, idx);
              const match = line.slice(idx, idx + query.length);
              const after = line.slice(idx + query.length);
              console.log(
                `    ${pc.dim(before)}${pc.yellow(pc.bold(match))}${pc.dim(after)}`
              );
              shown++;
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
