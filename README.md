# PromptVault

Git-like version control for LLM prompts. CLI + MCP server for Claude Code / Cursor.

## Features

- **22 CLI commands** — `init`, `add`, `commit`, `log`, `diff`, `branch`, `merge`, `tag`, `checkout`, `reset`, `status`, `list`, `show`, `search`, `export`, `import`, `template`, `lint`, `config`, `remote`, `push`, `pull`, `clone`
- **MCP server** — 9 tools for Claude Code and Cursor integration
- **Web dashboard** — Next.js app with GitHub OAuth, prompt sharing, API keys
- **Branch & merge** — Three-way merge with conflict detection
- **Templates** — `{{variable}}` substitution with `pv template render`
- **Prompt linting** — Check length, clarity, token count, trailing whitespace
- **Export/Import** — JSON, YAML, Markdown formats

## Install

```bash
npm install -g promptvault
```

Or use directly with npx:

```bash
npx promptvault init
```

## Quick Start

```bash
# Initialize a vault
pv init --author "Your Name" --email you@example.com

# Create a prompt file
echo "You are a helpful coding assistant." > assistant.prompt

# Track and commit
pv add assistant.prompt
pv commit -m "Add coding assistant prompt"

# View history
pv log

# Create a branch and make changes
pv branch experiment
pv checkout experiment
echo "You are a senior coding assistant. Be concise." > assistant.prompt
pv add assistant.prompt
pv commit -m "Make assistant more senior and concise"

# Merge back
pv checkout main
pv merge experiment
```

## CLI Reference

| Command | Description |
|---------|-------------|
| `pv init` | Initialize a new prompt vault |
| `pv add <files...>` | Stage prompt files for commit |
| `pv commit -m "msg"` | Commit staged changes |
| `pv log` | Show commit history |
| `pv status` | Show vault status |
| `pv diff [ref1] [ref2]` | Show differences between versions |
| `pv branch [name]` | List or create branches |
| `pv checkout <ref>` | Switch branches or restore commits |
| `pv merge <branch>` | Merge a branch into current branch |
| `pv tag [name]` | List or create tags |
| `pv reset [ref]` | Reset branch to a previous commit |
| `pv list` | List all tracked prompts |
| `pv show <name>` | Display a prompt's content |
| `pv search <query>` | Search prompts by content |
| `pv export` | Export prompts (JSON/YAML/Markdown) |
| `pv import <file>` | Import prompts from file |
| `pv template <action>` | Create, render, or list template variables |
| `pv lint [name]` | Check prompts for common issues |
| `pv config [key] [value]` | View or set vault configuration |
| `pv remote <action>` | Manage remote vaults |
| `pv push [remote]` | Push commits to a remote vault |
| `pv pull [remote]` | Pull commits from a remote vault |
| `pv clone <source>` | Clone a remote vault |

## MCP Server Integration

### Claude Code

Add to your Claude Code MCP config (`~/.claude/mcp.json` or project `.mcp.json`):

```json
{
  "mcpServers": {
    "promptvault": {
      "command": "pv-mcp",
      "args": []
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "promptvault": {
      "command": "npx",
      "args": ["-y", "promptvault", "mcp"]
    }
  }
}
```

### MCP Tools

| Tool | Description |
|------|-------------|
| `list_prompts` | List all tracked prompts |
| `get_prompt` | Get a prompt by name |
| `save_prompt` | Create or update a prompt (auto-commits) |
| `get_history` | Get commit history for a branch |
| `search_prompts` | Search prompts by keyword |
| `compare_versions` | Diff two commits |
| `get_status` | Show vault status |
| `lint_prompt` | Lint a prompt for issues |
| `render_template` | Render a template with variables |

## Web Dashboard

The web app provides a browser-based UI for managing prompts with team sharing.

### Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your database URL and OAuth credentials

# Initialize database
npx prisma db push

# Run dev server
npm run dev
```

### Environment Variables

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
GITHUB_ID="your-github-oauth-id"
GITHUB_SECRET="your-github-oauth-secret"
```

### REST API

All endpoints support session auth (browser) or API key auth (`X-API-Key` header).

```
GET    /api/prompts              — List prompts
POST   /api/prompts              — Create prompt
GET    /api/prompts/:id          — Get prompt
PUT    /api/prompts/:id          — Update prompt
DELETE /api/prompts/:id          — Delete prompt
GET    /api/prompts/:id/versions — List versions
POST   /api/prompts/:id/versions — Create version
GET    /api/keys                 — List API keys
POST   /api/keys                 — Create API key
DELETE /api/keys                 — Delete API key
```

## Templates

Create reusable prompt templates with `{{variable}}` placeholders:

```bash
# Create a template
pv template create code-review

# Edit the template file to add variables:
# You are reviewing {{language}} code. Focus on {{focus_area}}.

# See what variables are needed
pv template variables code-review

# Render with variables
pv template render code-review --var language=Python --var focus_area=security
```

## Prompt Linting

```bash
# Lint all prompts
pv lint

# Lint a specific prompt
pv lint assistant

# Example output:
#   ⚠ warn: Prompt is very short (under 20 chars)
#   ℹ info: Trailing whitespace detected
```

## `.pvignore`

Create a `.pvignore` file in your vault root to exclude files from `pv add --all`:

```
drafts/
*-draft.prompt
test-*.prompt
```

## Development

```bash
# Run CLI in dev mode
npm run pv -- init
npm run pv -- add file.prompt
npm run pv -- commit -m "test"

# Run MCP server in dev mode
npm run mcp

# Run tests
npm test

# Type check CLI
npm run lint

# Build CLI for distribution
npm run build:cli
```

## License

MIT
