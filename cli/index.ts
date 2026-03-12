#!/usr/bin/env node

/**
 * PromptVault CLI — Git-like version control for LLM prompts.
 *
 * Usage:
 *   pv init              Initialize a prompt vault
 *   pv add <file>        Stage a prompt file
 *   pv commit -m "msg"   Commit staged changes
 *   pv log               View commit history
 *   pv status            Show vault status
 *   pv diff              Show differences
 *   ...and more. Run `pv --help` for all commands.
 */

import { Command } from "commander";
import { registerAllCommands } from "./commands/index.js";

const program = new Command();

program
  .name("pv")
  .description("PromptVault — Git-like version control for LLM prompts")
  .version("1.0.0");

registerAllCommands(program);

program.parse(process.argv);

// Show help if no args
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
