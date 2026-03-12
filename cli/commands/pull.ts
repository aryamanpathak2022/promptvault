import { Command } from "commander";
import { VaultStorage } from "../storage.js";
import { ui } from "../ui.js";
import * as fs from "fs";
import * as path from "path";

export function registerPull(program: Command): void {
  program
    .command("pull")
    .description("Pull commits from a remote vault")
    .argument("[remote]", "Remote name", "origin")
    .action((remote: string) => {
      try {
        const storage = new VaultStorage();
        const config = storage.getConfig();
        const remotes = config.remotes || {};

        if (!remotes[remote]) {
          ui.error(`Remote '${remote}' not found.`);
          ui.info("Add one with: " + ui.cyan("pv remote add <name> <url>"));
          process.exit(1);
        }

        const remoteUrl = remotes[remote];

        if (remoteUrl.startsWith("/") || remoteUrl.startsWith("./") || remoteUrl.startsWith("..")) {
          pullFromLocal(storage, remoteUrl);
          return;
        }

        ui.info(`Pull from ${ui.cyan(remoteUrl)} — HTTP sync not yet implemented.`);
        ui.info("Local vault remotes (file paths) are fully supported.");
      } catch (err: unknown) {
        ui.error((err as Error).message);
        process.exit(1);
      }
    });
}

function pullFromLocal(storage: VaultStorage, remotePath: string): void {
  const resolvedPath = path.resolve(remotePath);

  if (!fs.existsSync(path.join(resolvedPath, ".promptvault"))) {
    ui.error(`No vault found at ${resolvedPath}`);
    process.exit(1);
  }

  const branch = storage.getCurrentBranch();
  const srcObjects = path.join(resolvedPath, ".promptvault", "objects");
  const dstObjects = path.join(storage.getVaultPath(), "objects");

  if (!fs.existsSync(srcObjects)) {
    ui.info("Remote has no commits.");
    return;
  }

  // Copy all commit objects we don't have
  let pulled = 0;
  const files = fs.readdirSync(srcObjects);
  for (const file of files) {
    const srcFile = path.join(srcObjects, file);
    const dstFile = path.join(dstObjects, file);
    if (!fs.existsSync(dstFile)) {
      fs.copyFileSync(srcFile, dstFile);
      pulled++;
    }
  }

  // Update local branch ref from remote
  const remoteRefFile = path.join(
    resolvedPath, ".promptvault", "refs", "heads", branch
  );
  if (fs.existsSync(remoteRefFile)) {
    const remoteHead = fs.readFileSync(remoteRefFile, "utf-8").trim();
    const localHead = storage.getBranchHead(branch);

    if (remoteHead !== localHead) {
      storage.setBranchHead(branch, remoteHead);
      // Restore files from the new head
      const commit = storage.getCommit(remoteHead);
      if (commit) {
        // Write prompt files
        for (const [name, content] of Object.entries(commit.files)) {
          const promptFile = path.join(
            storage.getVaultPath(), "prompts", `${name}.prompt`
          );
          fs.writeFileSync(promptFile, content, "utf-8");
        }
      }
    }
  }

  if (pulled > 0) {
    ui.success(`Pulled ${pulled} commit(s) from ${ui.cyan(remotePath)}`);
  } else {
    ui.info("Already up-to-date.");
  }
}
