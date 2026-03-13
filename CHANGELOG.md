# Changelog

## 1.0.0 (2026-03-12)

### Features

- **CLI**: Full Git-like version control for LLM prompts with 22 commands
  - `pv init` — Initialize a new prompt vault
  - `pv add` / `pv commit` / `pv log` / `pv status` / `pv diff` — Core version control
  - `pv branch` / `pv checkout` / `pv merge` — Branch management with three-way merge
  - `pv tag` / `pv reset` — Tagging and history navigation
  - `pv list` / `pv show` / `pv search` — Prompt discovery
  - `pv export` / `pv import` — JSON/YAML/Markdown interchange
  - `pv template` — Template variables with `{{variable}}` syntax
  - `pv lint` — Prompt quality checks (length, clarity, tokens, trailing whitespace)
  - `pv remote` / `pv push` / `pv pull` / `pv clone` — Local vault sync
  - `pv config` — Vault configuration management
- **MCP Server**: 9 tools for Claude Code / Cursor integration
  - `list_prompts`, `get_prompt`, `save_prompt`, `get_history`
  - `search_prompts`, `compare_versions`, `get_status`
  - `lint_prompt`, `render_template`
- **Web App**: Next.js dashboard with GitHub OAuth
  - Prompt CRUD with version history
  - Public prompt sharing and discovery
  - API key management (SHA-256 hashed storage)
  - REST API with session + API key auth

### Security

- API keys are now SHA-256 hashed before storage
- Input validation on prompt name (200 chars) and content (100K chars)
- Database indexes on frequently queried fields

### Testing

- 56 tests covering all CLI storage operations
