/**
 * Register all CLI commands with the Commander program.
 */

import { Command } from "commander";
import { registerInit } from "./init.js";
import { registerAdd } from "./add.js";
import { registerCommit } from "./commit.js";
import { registerLog } from "./log.js";
import { registerStatus } from "./status.js";
import { registerDiff } from "./diff.js";
import { registerCheckout } from "./checkout.js";
import { registerBranch } from "./branch.js";
import { registerMerge } from "./merge.js";
import { registerTag } from "./tag.js";
import { registerReset } from "./reset.js";
import { registerList } from "./list.js";
import { registerShow } from "./show.js";
import { registerSearch } from "./search.js";
import { registerExport } from "./export.js";
import { registerImport } from "./import.js";
import { registerTemplate } from "./template.js";
import { registerConfig } from "./config.js";
import { registerLint } from "./lint.js";
import { registerRemote } from "./remote.js";
import { registerPush } from "./push.js";
import { registerPull } from "./pull.js";
import { registerClone } from "./clone.js";

export function registerAllCommands(program: Command): void {
  // Core version control
  registerInit(program);
  registerAdd(program);
  registerCommit(program);
  registerLog(program);
  registerStatus(program);
  registerDiff(program);
  registerCheckout(program);
  registerBranch(program);
  registerMerge(program);
  registerTag(program);
  registerReset(program);

  // Prompt management
  registerList(program);
  registerShow(program);
  registerSearch(program);
  registerExport(program);
  registerImport(program);
  registerTemplate(program);
  registerConfig(program);
  registerLint(program);

  // Collaboration
  registerRemote(program);
  registerPush(program);
  registerPull(program);
  registerClone(program);
}
