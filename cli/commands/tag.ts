import { Command } from "commander";
import { VaultStorage } from "../storage.js";
import { ui } from "../ui.js";

export function registerTag(program: Command): void {
  program
    .command("tag")
    .description("Create, list, or delete tags")
    .argument("[name]", "Tag name to create")
    .option("-d, --delete <name>", "Delete a tag")
    .option("-c, --commit <hash>", "Tag a specific commit")
    .action((name?: string, opts?: { delete?: string; commit?: string }) => {
      try {
        const storage = new VaultStorage();
        storage.assertInitialized();

        if (opts?.delete) {
          storage.deleteTag(opts.delete);
          ui.success(`Deleted tag ${ui.yellow(opts.delete)}`);
          return;
        }

        if (name) {
          storage.createTag(name, opts?.commit);
          ui.success(`Created tag ${ui.yellow(name)}`);
          return;
        }

        // List tags
        const tags = storage.getTags();
        if (tags.length === 0) {
          ui.info("No tags yet. Create one with: " + ui.cyan("pv tag <name>"));
          return;
        }

        for (const tag of tags) {
          console.log(`  ${ui.yellow(tag.name)}  →  ${ui.hash(tag.hash)}`);
        }
      } catch (err: unknown) {
        ui.error((err as Error).message);
        process.exit(1);
      }
    });
}
