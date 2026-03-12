import { Command } from "commander";
import { VaultStorage } from "../storage.js";
import { ui } from "../ui.js";
import * as fs from "fs";
import * as path from "path";

export function registerClone(program: Command): void {
  program
    .command("clone")
    .description("Clone a remote vault")
    .argument("<source>", "Source vault path or URL")
    .argument("[directory]", "Target directory")
    .action((source: string, directory?: string) => {
      try {
        const sourcePath = path.resolve(source);
        const targetDir = directory || path.basename(sourcePath);
        const targetPath = path.resolve(targetDir);

        if (fs.existsSync(targetPath)) {
          ui.error(`Directory '${targetDir}' already exists.`);
          process.exit(1);
        }

        // Verify source is a vault
        if (!fs.existsSync(path.join(sourcePath, ".promptvault"))) {
          ui.error(`No vault found at ${source}`);
          process.exit(1);
        }

        // Create target directory
        fs.mkdirSync(targetPath, { recursive: true });

        // Initialize a new vault
        const storage = new VaultStorage(targetPath);
        storage.init();

        // Copy all objects
        const srcObjects = path.join(sourcePath, ".promptvault", "objects");
        const dstObjects = path.join(targetPath, ".promptvault", "objects");

        if (fs.existsSync(srcObjects)) {
          const files = fs.readdirSync(srcObjects);
          for (const file of files) {
            fs.copyFileSync(
              path.join(srcObjects, file),
              path.join(dstObjects, file)
            );
          }
        }

        // Copy refs
        const srcHeads = path.join(sourcePath, ".promptvault", "refs", "heads");
        const dstHeads = path.join(targetPath, ".promptvault", "refs", "heads");
        if (fs.existsSync(srcHeads)) {
          for (const file of fs.readdirSync(srcHeads)) {
            fs.copyFileSync(
              path.join(srcHeads, file),
              path.join(dstHeads, file)
            );
          }
        }

        // Copy tags
        const srcTags = path.join(sourcePath, ".promptvault", "refs", "tags");
        const dstTags = path.join(targetPath, ".promptvault", "refs", "tags");
        if (fs.existsSync(srcTags)) {
          for (const file of fs.readdirSync(srcTags)) {
            fs.copyFileSync(
              path.join(srcTags, file),
              path.join(dstTags, file)
            );
          }
        }

        // Set up origin remote
        storage.setConfig({
          remotes: { origin: sourcePath },
        });

        // Restore prompt files from HEAD
        const head = storage.getBranchHead("main");
        if (head) {
          const commit = storage.getCommit(head);
          if (commit) {
            for (const [name, content] of Object.entries(commit.files)) {
              // Write to target root as prompt files
              fs.writeFileSync(
                path.join(targetPath, `${name}.prompt`),
                content,
                "utf-8"
              );
              // Also write to prompts dir
              fs.writeFileSync(
                path.join(targetPath, ".promptvault", "prompts", `${name}.prompt`),
                content,
                "utf-8"
              );
            }
          }
        }

        ui.success(`Cloned vault to ${ui.cyan(targetDir)}`);
        ui.info(`Remote 'origin' set to ${sourcePath}`);
      } catch (err: unknown) {
        ui.error((err as Error).message);
        process.exit(1);
      }
    });
}
