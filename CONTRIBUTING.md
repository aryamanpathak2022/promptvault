# Contributing to PromptVault

Thank you for your interest in contributing to PromptVault! This document outlines the process for contributing to our project.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please be respectful and inclusive.

## Getting Started

### Prerequisites

- **Node.js** 20.x or later
- **npm** 10.x or later
- **PostgreSQL** 14.x or later (for local development)
- **Git**

### Setup Development Environment

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/aryamanpathak2022/promptvault.git
   cd promptvault
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your local configuration:
   - `DATABASE_URL` — PostgreSQL connection string
   - `NEXTAUTH_SECRET` — Generate with `openssl rand -hex 32`
   - `NEXTAUTH_URL` — `http://localhost:3000`
   - `GITHUB_ID` — GitHub OAuth app client ID
   - `GITHUB_SECRET` — GitHub OAuth app client secret

4. **Set up the database**

   ```bash
   npx prisma db push
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

   The web app will be available at [http://localhost:3000](http://localhost:3000).

### Running Tests

Run the full test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

### Building the CLI

To build the CLI for local testing:

```bash
npm run build:cli
npm link  # Link globally for testing
```

## Coding Conventions

### General

- **TypeScript strict mode** — All code must pass TypeScript's strict type checking
- **ESLint** — Run `npm run lint` before committing
- **Prettier** — Code formatting is enforced via pre-commit hooks

### File Organization

```
promptvault/
├── app/                  # Next.js App Router
├── cli/                  # CLI tool + MCP server
│   ├── commands/         # Individual CLI commands
│   ├── mcp/              # MCP server implementation
│   └── storage.ts        # Local vault storage engine
├── components/           # React components
├── lib/                  # Shared utilities
├── prisma/               # Database schema
└── tests/                # Vitest test suite
```

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation changes
- `style` — Code style (formatting, semicolons)
- `refactor` — Code refactoring
- `test` — Adding or updating tests
- `chore` — Maintenance tasks

**Examples:**

```
feat(cli): add branch delete command
fix(mcp): resolve prompt search returning empty results
docs: update API reference with new endpoints
```

### Pull Request Process

1. **Create a feature branch**

   ```bash
   git checkout -b feat/my-feature
   # or
   git checkout -b fix/bug-description
   ```

2. **Make your changes**

   - Write code following our conventions
   - Add tests for new functionality
   - Update documentation if needed

3. **Run checks before committing**

   ```bash
   npm test        # Run tests
   npm run lint    # Check TypeScript
   ```

4. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat(cli): add new command"
   ```

5. **Push and create a Pull Request**

   ```bash
   git push origin feat/my-feature
   ```

   Then open a PR on GitHub with:
   - Clear title describing the change
   - Link to any related issues
   - Description of what you changed and why

6. **Review process**

   - Maintainers will review your PR
   - Address any feedback promptly
   - Once approved, your PR will be merged

## Good First Issues

Looking for ways to contribute? Check out our [good first issues](https://github.com/aryamanpathak2022/promptvault/labels/good%20first%20issue) label.

### Sample Good First Issues

- Add tests for a specific CLI command
- Improve error messages
- Add a new linting rule
- Update documentation
- Fix a typo

## Development Tips

### Testing MCP Server Locally

```bash
# Build the MCP server
npm run build:cli

# Test MCP server manually
node dist/cli/mcp/server.js
```

### Database

Reset your local database:

```bash
npx prisma db push --force-reset
```

View your database with Prisma Studio:

```bash
npx prisma studio
```

### Adding New CLI Commands

1. Create a new file in `cli/commands/`
2. Implement the command using Commander.js
3. Register in `cli/index.ts`
4. Add tests in `tests/`

## Resources

- [Documentation](https://promptvault.example.com)
- [GitHub Issues](https://github.com/aryamanpathak2022/promptvault/issues)
- [Discussions](https://github.com/aryamanpathak2022/promptvault/discussions)

## Questions?

If you have questions, feel free to open a [GitHub Discussion](https://github.com/aryamanpathak2022/promptvault/discussions) or ask in our community channel.
