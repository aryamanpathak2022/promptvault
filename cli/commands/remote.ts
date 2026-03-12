import { Command } from "commander";
import { VaultStorage } from "../storage.js";
import { ui } from "../ui.js";

export function registerRemote(program: Command): void {
  const remote = program
    .command("remote")
    .description("Manage remote vaults");

  remote
    .command("add")
    .description("Add a remote vault")
    .argument("<name>", "Remote name (e.g., origin)")
    .argument("<url>", "Remote URL")
    .action((name: string, url: string) => {
      try {
        const storage = new VaultStorage();
        const config = storage.getConfig();
        const remotes = config.remotes || {};

        if (remotes[name]) {
          ui.error(`Remote '${name}' already exists.`);
          process.exit(1);
        }

        remotes[name] = url;
        storage.setConfig({ remotes });
        ui.success(`Added remote ${ui.cyan(name)} → ${url}`);
      } catch (err: unknown) {
        ui.error((err as Error).message);
        process.exit(1);
      }
    });

  remote
    .command("remove")
    .description("Remove a remote vault")
    .argument("<name>", "Remote name")
    .action((name: string) => {
      try {
        const storage = new VaultStorage();
        const config = storage.getConfig();
        const remotes = config.remotes || {};

        if (!remotes[name]) {
          ui.error(`Remote '${name}' not found.`);
          process.exit(1);
        }

        delete remotes[name];
        storage.setConfig({ remotes });
        ui.success(`Removed remote ${ui.cyan(name)}`);
      } catch (err: unknown) {
        ui.error((err as Error).message);
        process.exit(1);
      }
    });

  remote
    .command("list")
    .description("List remote vaults")
    .action(() => {
      try {
        const storage = new VaultStorage();
        const config = storage.getConfig();
        const remotes = config.remotes || {};

        if (Object.keys(remotes).length === 0) {
          ui.info("No remotes configured.");
          ui.info("Add one with: " + ui.cyan("pv remote add <name> <url>"));
          return;
        }

        for (const [name, url] of Object.entries(remotes)) {
          console.log(`  ${ui.cyan(name)}\t${url}`);
        }
      } catch (err: unknown) {
        ui.error((err as Error).message);
        process.exit(1);
      }
    });

  // Default action: list remotes
  remote.action(() => {
    try {
      const storage = new VaultStorage();
      const config = storage.getConfig();
      const remotes = config.remotes || {};

      if (Object.keys(remotes).length === 0) {
        ui.info("No remotes configured.");
        return;
      }

      for (const [name, url] of Object.entries(remotes)) {
        console.log(`  ${ui.cyan(name)}\t${url}`);
      }
    } catch (err: unknown) {
      ui.error((err as Error).message);
      process.exit(1);
    }
  });
}
