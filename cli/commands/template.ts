import { Command } from "commander";
import { VaultStorage } from "../storage.js";
import { ui } from "../ui.js";
import * as fs from "fs";
import * as path from "path";

export function registerTemplate(program: Command): void {
  program
    .command("template")
    .description("Manage prompt templates with {{variable}} substitution")
    .argument("<action>", "Action: create, render, variables")
    .argument("[name]", "Prompt name")
    .option("-v, --var <vars...>", "Variables in key=value format")
    .option("-o, --output <file>", "Output rendered template to file")
    .action((action: string, name?: string, opts?: { var?: string[]; output?: string }) => {
      try {
        const storage = new VaultStorage();

        switch (action) {
          case "create": {
            if (!name) {
              ui.error("Template name required: pv template create <name>");
              process.exit(1);
            }
            const templateContent = `# {{title}}

You are a {{role}}.

## Task
{{task}}

## Context
{{context}}

## Output Format
{{format}}
`;
            const filePath = path.join(process.cwd(), `${name}.prompt`);
            fs.writeFileSync(filePath, templateContent, "utf-8");
            ui.success(`Created template ${ui.cyan(filePath)}`);
            ui.info("Variables: {{title}}, {{role}}, {{task}}, {{context}}, {{format}}");
            break;
          }

          case "render": {
            if (!name) {
              ui.error("Prompt name required: pv template render <name> -v key=value");
              process.exit(1);
            }
            const prompt = storage.getPrompt(name);
            if (!prompt) {
              ui.error(`Prompt '${name}' not found.`);
              process.exit(1);
            }

            const variables: Record<string, string> = {};
            if (opts?.var) {
              for (const v of opts.var) {
                const [key, ...rest] = v.split("=");
                variables[key] = rest.join("=");
              }
            }

            const rendered = storage.renderTemplate(prompt.content, variables);

            if (opts?.output) {
              fs.writeFileSync(opts.output, rendered, "utf-8");
              ui.success(`Rendered template to ${ui.cyan(opts.output)}`);
            } else {
              console.log(rendered);
            }
            break;
          }

          case "variables":
          case "vars": {
            if (!name) {
              ui.error("Prompt name required: pv template variables <name>");
              process.exit(1);
            }
            const p = storage.getPrompt(name);
            if (!p) {
              ui.error(`Prompt '${name}' not found.`);
              process.exit(1);
            }

            const vars = storage.extractTemplateVariables(p.content);
            if (vars.length === 0) {
              ui.info("No template variables found.");
            } else {
              ui.info(`Template variables in '${name}':`);
              for (const v of vars) {
                console.log(`  ${ui.yellow("{{" + v + "}}")}`);
              }
            }
            break;
          }

          default:
            ui.error(`Unknown template action: ${action}`);
            ui.info("Available actions: create, render, variables");
            process.exit(1);
        }
      } catch (err: unknown) {
        ui.error((err as Error).message);
        process.exit(1);
      }
    });
}
