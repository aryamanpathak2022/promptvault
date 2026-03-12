#!/usr/bin/env node

/**
 * PromptVault MCP Server
 *
 * Implements the Model Context Protocol for integration with
 * Claude Code, Cursor, and other MCP-compatible editors.
 *
 * Transport: stdio (standard input/output)
 *
 * Tools provided:
 *   - list_prompts      — List all tracked prompts
 *   - get_prompt        — Get a prompt by name
 *   - save_prompt       — Create or update a prompt
 *   - get_history       — Get commit history
 *   - search_prompts    — Search prompts by query
 *   - compare_versions  — Compare two commits
 *   - get_status        — Show vault status
 *   - lint_prompt       — Lint a prompt for issues
 *   - render_template   — Render a prompt template with variables
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { VaultStorage } from "../storage.js";
import * as fs from "fs";
import * as path from "path";

const TOOL_DEFINITIONS = [
  {
    name: "list_prompts",
    description: "List all prompts tracked in the vault",
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "get_prompt",
    description: "Get a prompt's content by name",
    inputSchema: {
      type: "object" as const,
      properties: {
        name: {
          type: "string",
          description: "The prompt name",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "save_prompt",
    description: "Save a prompt to the vault (creates file, stages, and commits)",
    inputSchema: {
      type: "object" as const,
      properties: {
        name: {
          type: "string",
          description: "The prompt name",
        },
        content: {
          type: "string",
          description: "The prompt content",
        },
        message: {
          type: "string",
          description: "Commit message",
        },
      },
      required: ["name", "content"],
    },
  },
  {
    name: "get_history",
    description: "Get commit history for the vault",
    inputSchema: {
      type: "object" as const,
      properties: {
        count: {
          type: "number",
          description: "Number of commits to return (default: 10)",
        },
      },
    },
  },
  {
    name: "search_prompts",
    description: "Search prompts by name or content",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Search query",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "compare_versions",
    description: "Compare two commits to see what changed",
    inputSchema: {
      type: "object" as const,
      properties: {
        hash1: {
          type: "string",
          description: "First commit hash",
        },
        hash2: {
          type: "string",
          description: "Second commit hash",
        },
      },
      required: ["hash1", "hash2"],
    },
  },
  {
    name: "get_status",
    description: "Get the current vault status (branch, staged, modified, untracked)",
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "lint_prompt",
    description: "Check a prompt for common issues",
    inputSchema: {
      type: "object" as const,
      properties: {
        content: {
          type: "string",
          description: "Prompt content to lint (or provide name to lint a tracked prompt)",
        },
        name: {
          type: "string",
          description: "Name of a tracked prompt to lint",
        },
      },
    },
  },
  {
    name: "render_template",
    description: "Render a prompt template with variable substitution",
    inputSchema: {
      type: "object" as const,
      properties: {
        name: {
          type: "string",
          description: "Prompt name",
        },
        variables: {
          type: "object",
          description: "Variables to substitute (key-value pairs)",
        },
      },
      required: ["name"],
    },
  },
];

function createServer(): Server {
  const server = new Server(
    {
      name: "promptvault",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  // List tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOL_DEFINITIONS,
  }));

  // List resources (prompts as resources)
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    try {
      const storage = new VaultStorage();
      if (!storage.isInitialized()) {
        return { resources: [] };
      }

      const prompts = storage.listPrompts();
      return {
        resources: prompts.map((p) => ({
          uri: `promptvault://prompts/${encodeURIComponent(p.name)}`,
          name: p.name,
          mimeType: "text/plain",
          description: `Prompt: ${p.name} (${Math.ceil(p.content.length / 4)} tokens)`,
        })),
      };
    } catch {
      return { resources: [] };
    }
  });

  // Read resource
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;
    const match = uri.match(/^promptvault:\/\/prompts\/(.+)$/);
    if (!match) {
      throw new Error(`Unknown resource URI: ${uri}`);
    }

    const name = decodeURIComponent(match[1]);
    const storage = new VaultStorage();
    const prompt = storage.getPrompt(name);

    if (!prompt) {
      throw new Error(`Prompt '${name}' not found`);
    }

    return {
      contents: [
        {
          uri,
          mimeType: "text/plain",
          text: prompt.content,
        },
      ],
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      const storage = new VaultStorage();

      switch (name) {
        case "list_prompts": {
          const prompts = storage.listPrompts();
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  prompts.map((p) => ({
                    name: p.name,
                    tokens: Math.ceil(p.content.length / 4),
                    preview: p.content.slice(0, 100),
                  })),
                  null,
                  2
                ),
              },
            ],
          };
        }

        case "get_prompt": {
          const prompt = storage.getPrompt(args?.name as string);
          if (!prompt) {
            return {
              content: [{ type: "text" as const, text: `Prompt '${args?.name}' not found.` }],
              isError: true,
            };
          }
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  { name: prompt.name, content: prompt.content },
                  null,
                  2
                ),
              },
            ],
          };
        }

        case "save_prompt": {
          const promptName = args?.name as string;
          const content = args?.content as string;
          const message = (args?.message as string) || `Update prompt: ${promptName}`;

          if (!promptName || !content) {
            return {
              content: [{ type: "text" as const, text: "Name and content are required." }],
              isError: true,
            };
          }

          // Write file
          const filePath = path.join(storage.getRoot(), `${promptName}.prompt`);
          fs.writeFileSync(filePath, content, "utf-8");

          // Stage and commit
          storage.stageFile(filePath);
          const commit = storage.commit(message);

          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  {
                    saved: true,
                    commit: commit.hash,
                    message: commit.message,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        case "get_history": {
          const count = (args?.count as number) || 10;
          const commits = storage.getLog();
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  commits.slice(0, count).map((c) => ({
                    hash: c.hash,
                    message: c.message,
                    author: c.author,
                    timestamp: c.timestamp,
                    files: Object.keys(c.files),
                  })),
                  null,
                  2
                ),
              },
            ],
          };
        }

        case "search_prompts": {
          const query = args?.query as string;
          if (!query) {
            return {
              content: [{ type: "text" as const, text: "Search query is required." }],
              isError: true,
            };
          }
          const results = storage.searchPrompts(query);
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  results.map((r) => ({
                    name: r.name,
                    preview: r.content.slice(0, 200),
                  })),
                  null,
                  2
                ),
              },
            ],
          };
        }

        case "compare_versions": {
          const hash1 = args?.hash1 as string;
          const hash2 = args?.hash2 as string;
          if (!hash1 || !hash2) {
            return {
              content: [{ type: "text" as const, text: "Both hash1 and hash2 are required." }],
              isError: true,
            };
          }
          const diffs = storage.diff(hash1, hash2);
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  diffs.map((d) => ({
                    file: d.fileName,
                    additions: d.additions,
                    deletions: d.deletions,
                    changes: d.hunks.map((h) => ({
                      type: h.type,
                      text: h.value.slice(0, 500),
                    })),
                  })),
                  null,
                  2
                ),
              },
            ],
          };
        }

        case "get_status": {
          const status = storage.status();
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  {
                    branch: status.branch,
                    staged: status.staged.map((s) => s.name),
                    modified: status.modified,
                    untracked: status.untracked,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        case "lint_prompt": {
          let content = args?.content as string | undefined;
          if (!content && args?.name) {
            const prompt = storage.getPrompt(args.name as string);
            if (!prompt) {
              return {
                content: [{ type: "text" as const, text: `Prompt '${args.name}' not found.` }],
                isError: true,
              };
            }
            content = prompt.content;
          }
          if (!content) {
            return {
              content: [{ type: "text" as const, text: "Provide content or name to lint." }],
              isError: true,
            };
          }
          const issues = storage.lintPrompt(content);
          return {
            content: [{ type: "text" as const, text: JSON.stringify(issues, null, 2) }],
          };
        }

        case "render_template": {
          const promptName = args?.name as string;
          const variables = (args?.variables as Record<string, string>) || {};
          const prompt = storage.getPrompt(promptName);
          if (!prompt) {
            return {
              content: [{ type: "text" as const, text: `Prompt '${promptName}' not found.` }],
              isError: true,
            };
          }
          const rendered = storage.renderTemplate(prompt.content, variables);
          return {
            content: [{ type: "text" as const, text: rendered }],
          };
        }

        default:
          return {
            content: [{ type: "text" as const, text: `Unknown tool: ${name}` }],
            isError: true,
          };
      }
    } catch (err: unknown) {
      return {
        content: [{ type: "text" as const, text: `Error: ${(err as Error).message}` }],
        isError: true,
      };
    }
  });

  return server;
}

async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("MCP server error:", err);
  process.exit(1);
});
