/**
 * CLI UI helpers — colored output, formatting, spinners.
 */

import pc from "picocolors";

export const ui = {
  // Status indicators
  success: (msg: string) => console.log(pc.green("✓") + " " + msg),
  error: (msg: string) => console.error(pc.red("✗") + " " + msg),
  warn: (msg: string) => console.log(pc.yellow("!") + " " + msg),
  info: (msg: string) => console.log(pc.blue("ℹ") + " " + msg),

  // Formatting
  bold: (s: string) => pc.bold(s),
  dim: (s: string) => pc.dim(s),
  green: (s: string) => pc.green(s),
  red: (s: string) => pc.red(s),
  yellow: (s: string) => pc.yellow(s),
  blue: (s: string) => pc.blue(s),
  cyan: (s: string) => pc.cyan(s),
  magenta: (s: string) => pc.magenta(s),

  // Commit hash display
  hash: (h: string) => pc.yellow(h.slice(0, 8)),

  // Branch display
  branch: (name: string, current?: boolean) =>
    current ? pc.green("* " + name) : "  " + name,

  // Section header
  header: (title: string) =>
    console.log("\n" + pc.bold(pc.cyan(title)) + "\n"),

  // Table-like output
  keyValue: (key: string, value: string, keyWidth = 12) =>
    console.log(
      "  " + pc.dim(key.padEnd(keyWidth)) + " " + value
    ),

  // Diff display
  diffAdd: (line: string) => pc.green("+ " + line),
  diffRemove: (line: string) => pc.red("- " + line),
  diffContext: (line: string) => pc.dim("  " + line),

  // Divider
  divider: () => console.log(pc.dim("─".repeat(60))),

  // Prompt content preview (truncated)
  preview: (content: string, maxLines = 3) => {
    const lines = content.split("\n");
    const shown = lines.slice(0, maxLines);
    const text = shown.join("\n");
    if (lines.length > maxLines) {
      return text + pc.dim(`\n  ... (${lines.length - maxLines} more lines)`);
    }
    return text;
  },

  // Lint level colors
  lintLevel: (level: "warning" | "error" | "info") => {
    switch (level) {
      case "error":
        return pc.red("ERROR");
      case "warning":
        return pc.yellow("WARN ");
      case "info":
        return pc.blue("INFO ");
    }
  },
};
