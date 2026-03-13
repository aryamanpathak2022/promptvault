import { Command } from "commander";
import { VaultStorage } from "../storage.js";
import { ui } from "../ui.js";
import * as fs from "fs";
import * as path from "path";

export function registerPush(program: Command): void {
  program
    .command("push")
    .description("Push commits to a remote vault")
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

        // For local remotes (directory path), copy objects and refs
        if (remoteUrl.startsWith("/") || remoteUrl.startsWith("./") || remoteUrl.startsWith("..")) {
          pushToLocal(storage, remoteUrl);
          return;
        }

        // For HTTP remotes, show info (would need server implementation)
        ui.info(`Push to ${ui.cyan(remoteUrl)} — HTTP sync not yet implemented.`);
        ui.info("Local vault remotes (file paths) are fully supported.");
        ui.info(`Example: ${ui.cyan("pv remote add origin /path/to/shared/vault")}`);
      } catch (err: unknown) {
        ui.error((err as Error).message);
        process.exit(1);
      }
    });
}

function pushToLocal(storage: VaultStorage, remotePath: string): void {
  const resolvedPath = path.resolve(remotePath);

  if (!fs.existsSync(path.join(resolvedPath, ".promptvault"))) {
    ui.error(`No vault found at ${resolvedPath}`);
    process.exit(1);
  }

  const branch = storage.getCurrentBranch();
  const commits = storage.getLog(branch);

  if (commits.length === 0) {
    ui.info("Nothing to push.");
    return;
  }

  // Copy commit objects
  const srcObjects = path.join(storage.getVaultPath(), "objects");
  const dstObjects = path.join(resolvedPath, ".promptvault", "objects");

  let pushed = 0;
  for (const commit of commits) {
    const srcFile = path.join(srcObjects, `${commit.hash}.json`);
    const dstFile = path.join(dstObjects, `${commit.hash}.json`);

    if (!fs.existsSync(dstFile)) {
      fs.copyFileSync(srcFile, dstFile);
      pushed++;
    }
  }

  // Update remote branch ref
  const head = storage.getBranchHead(branch);
  if (head) {
    const refFile = path.join(
      resolvedPath, ".promptvault", "refs", "heads", branch
    );
    fs.mkdirSync(path.dirname(refFile), { recursive: true });
    fs.writeFileSync(refFile, head, "utf-8");
  }

  if (pushed > 0) {
    ui.success(`Pushed ${pushed} commit(s) to ${ui.cyan(remotePath)}`);
  } else {
    ui.info("Everything up-to-date.");
  }
}
