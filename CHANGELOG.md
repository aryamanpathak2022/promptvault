# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Fixed

### Removed

## [1.0.0] - 2026-03-12

### Added

- **CLI**: Full Git-like version control for LLM prompts with 22 commands
  - Core: `pv init`, `pv add`, `pv commit`, `pv log`, `pv status`, `pv diff`
  - Branching: `pv branch`, `pv checkout`, `pv merge`, `pv tag`, `pv reset`
  - Discovery: `pv list`, `pv show`, `pv search`
  - Interchange: `pv export`, `pv import` (JSON/YAML/Markdown)
  - Templates: `pv template` with `{{variable}}` syntax
  - Quality: `pv lint` for prompt checks (length, clarity, tokens, trailing whitespace)
  - Sync: `pv remote`, `pv push`, `pv pull`, `pv clone`
  - Config: `pv config` for vault settings

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

[Unreleased]: https://github.com/aryamanpathak2022/promptvault/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/aryamanpathak2022/promptvault/releases/tag/v1.0.0
