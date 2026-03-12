# PromptVault

> Version control for your LLM prompts. Web dashboard + CLI + MCP server.

Prompts are code — they evolve, break, and need rollbacks. But most teams manage them in Notion docs or scattered text files with no history. PromptVault gives prompts the same version control workflow developers already know: init, commit, diff, branch, merge, push, pull.

## Features

- **Web dashboard** with version history and diff viewer
- **CLI tool** for terminal workflows (22 Git-like commands)
- **MCP server** for Claude Code / Cursor integration
- **Public prompt sharing** and community explore page
- **Export/import** for backup and migration (JSON, YAML, Markdown)
- **Template engine** with `{{variable}}` substitution
- **Prompt linting** for quality checks
- **Branching & merging** with three-way merge and conflict detection
- **API key auth** for programmatic access

## Quick Start

### Web Dashboard

```bash
git clone https://github.com/aryamanpathak2022/promptvault.git
cd promptvault
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local — see "Environment Variables" below

# Set up database
npx prisma db push

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with GitHub.

### CLI Installation

```bash
# Build the CLI
npm run build:cli

# Link globally
npm link

# Initialize a vault
pv init --author "Your Name" --email you@example.com

# Create and track a prompt
echo "You are a helpful coding assistant." > assistant.prompt
pv add assistant.prompt
pv commit -m "Add coding assistant prompt"

# View history and diffs
pv log
pv diff HEAD~1 HEAD

# Branch and merge
pv branch experiment
pv checkout experiment
# ... edit prompts ...
pv add assistant.prompt
pv commit -m "Try a more concise style"
pv checkout main
pv merge experiment
```

### MCP Server Setup

Build the CLI first (`npm run build:cli`), then add to your editor config:

**Claude Code** (`~/.claude.json` or project `.mcp.json`):

```json
{
  "mcpServers": {
    "promptvault": {
      "command": "node",
      "args": ["/path/to/promptvault/dist/cli/mcp/server.js"]
    }
  }
}
```

**Cursor** (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "promptvault": {
      "command": "node",
      "args": ["/path/to/promptvault/dist/cli/mcp/server.js"]
    }
  }
}
```

The MCP server reads from the local `.pv/` vault in your working directory. Run `pv init` first.

## CLI Command Reference

### Core Version Control

| Command | Description |
|---------|-------------|
| `pv init` | Initialize a new prompt vault |
| `pv add <files...>` | Stage prompt files for commit |
| `pv commit -m "msg"` | Commit staged changes |
| `pv log` | Show commit history |
| `pv status` | Show vault status (staged, modified, untracked) |
| `pv diff [ref1] [ref2]` | Show differences between versions |
| `pv checkout <ref>` | Switch branches or restore commits |
| `pv branch [name]` | List or create branches |
| `pv merge <branch>` | Merge a branch into current branch |
| `pv tag [name]` | List or create tags |
| `pv reset [ref]` | Reset branch to a previous commit |

### Prompt Management

| Command | Description |
|---------|-------------|
| `pv list` | List all tracked prompts with token counts |
| `pv show <name>` | Display a prompt's content |
| `pv search <query>` | Search prompts by name or content |
| `pv export` | Export prompts to JSON, YAML, or Markdown |
| `pv import <file>` | Import prompts from a file |
| `pv template <action>` | Create, render, or list templates with `{{variable}}` substitution |
| `pv config [key] [value]` | Get or set vault configuration |
| `pv lint [name]` | Check prompts for common issues |

### Collaboration

| Command | Description |
|---------|-------------|
| `pv remote <add\|remove\|list>` | Manage remote vault connections |
| `pv push [remote]` | Push commits to a remote vault |
| `pv pull [remote]` | Pull commits from a remote vault |
| `pv clone <source>` | Clone a remote vault |

## MCP Tools Reference

| Tool | Description |
|------|-------------|
| `list_prompts` | List all prompts tracked in the vault |
| `get_prompt` | Get a prompt's content by name |
| `save_prompt` | Save a prompt (creates file, stages, and commits) |
| `get_history` | Get commit history |
| `search_prompts` | Search prompts by name or content |
| `compare_versions` | Compare two commits to see what changed |
| `get_status` | Get current vault status |
| `lint_prompt` | Check a prompt for common issues |
| `render_template` | Render a prompt template with variable substitution |

Prompts are also exposed as MCP resources via `promptvault://prompts/<name>`.

## API Reference

All endpoints support session auth (browser) or API key auth (`X-API-Key` header).

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/prompts` | List user's prompts (supports `?search=` and `?tag=`) |
| `POST` | `/api/prompts` | Create a new prompt |
| `GET` | `/api/prompts/:id` | Get a single prompt with latest version |
| `PUT` | `/api/prompts/:id` | Update prompt metadata |
| `DELETE` | `/api/prompts/:id` | Delete a prompt and all versions |
| `GET` | `/api/prompts/:id/versions` | List all versions |
| `POST` | `/api/prompts/:id/versions` | Create a new version |
| `GET` | `/api/keys` | List API keys (masked) |
| `POST` | `/api/keys` | Generate a new API key |
| `DELETE` | `/api/keys` | Revoke an API key |

Generate API keys from the dashboard at `/dashboard/settings`:

```bash
curl -H "X-API-Key: pv_your-key-here" https://your-instance.com/api/prompts
```

## Self-Hosting

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | Random string for JWT signing (`openssl rand -hex 32`) |
| `NEXTAUTH_URL` | Yes | Your app's URL (e.g., `https://promptvault.example.com`) |
| `GITHUB_ID` | Yes | GitHub OAuth app client ID |
| `GITHUB_SECRET` | Yes | GitHub OAuth app client secret |

### Deploy to Vercel

1. Push to GitHub
2. Import in [Vercel](https://vercel.com) — auto-detects Next.js
3. Add environment variables in project settings
4. Set up a PostgreSQL database ([Neon](https://neon.tech) recommended)

### Deploy to Railway

1. Connect your repo in [Railway](https://railway.app)
2. Add a PostgreSQL plugin (auto-provides `DATABASE_URL`)
3. Set remaining environment variables
4. Deploy

### Manual

```bash
npm install
npx prisma db push
npm run build
npm start
```

## Architecture

```
promptvault/
├── app/                  # Next.js App Router (web dashboard + API)
│   ├── api/              #   REST API endpoints
│   ├── dashboard/        #   Authenticated dashboard pages
│   ├── explore/          #   Public prompt discovery
│   └── p/[id]/           #   Public prompt viewer
├── cli/                  # CLI tool + MCP server
│   ├── commands/         #   22 Git-like commands
│   ├── mcp/              #   MCP server (stdio transport)
│   └── storage.ts        #   Local vault engine (.pv/ directory)
├── components/           # React components
├── lib/                  # Shared utilities (auth, prisma, formatting)
├── prisma/               # Database schema
└── tests/                # Vitest test suite (56 tests)
```

The **web app** stores data in PostgreSQL via Prisma. The **CLI** manages a local `.pv/` directory with its own commit graph, branching, and merge logic — no server required. The **MCP server** wraps the CLI storage engine over the Model Context Protocol for editor integration. The CLI can sync with the web API via `pv remote` / `pv push` / `pv pull`.

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19, Turbopack)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 4
- **Database:** PostgreSQL via Prisma 7 (Neon serverless adapter)
- **Auth:** NextAuth.js v5 (GitHub OAuth, JWT strategy)
- **CLI:** Commander.js, chalk
- **MCP:** @modelcontextprotocol/sdk (stdio transport)
- **Testing:** Vitest
- **CI/CD:** GitHub Actions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Make changes and add tests
4. Run the test suite (`npm test`)
5. Commit with a descriptive message
6. Open a pull request

## License

[MIT](LICENSE)
