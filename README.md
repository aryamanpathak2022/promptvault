# PromptVault Web

A full-stack Next.js web app for PromptVault — version control for your AI prompts.

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **NextAuth.js v5** (GitHub + Google OAuth)
- **Prisma v7** + SQLite (swap to Postgres for prod)
- **better-sqlite3** adapter for Prisma v7

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.local` (already created) and fill in your OAuth credentials:

```env
DATABASE_URL="file:prisma/dev.db"
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
GITHUB_ID=your-github-oauth-app-id
GITHUB_SECRET=your-github-oauth-app-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Initialize database

```bash
npx prisma db push
```

### 4. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Setting up OAuth

### GitHub OAuth
1. Go to GitHub Settings → Developer Settings → OAuth Apps → New OAuth App
2. Set Authorization callback URL to: `http://localhost:3000/api/auth/callback/github`
3. Copy Client ID and Client Secret to `.env.local`

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Secret to `.env.local`

## API

All API routes support authentication via:
- **NextAuth session** (browser cookies)
- **API key header**: `X-API-Key: pv_your_key_here`

### Endpoints

```
GET  /api/prompts              — List all prompts
POST /api/prompts              — Create prompt
GET  /api/prompts/:id          — Get prompt
PUT  /api/prompts/:id          — Update prompt
DEL  /api/prompts/:id          — Delete prompt
GET  /api/prompts/:id/versions — List versions
POST /api/prompts/:id/versions — Add new version
GET  /api/keys                 — List API keys
POST /api/keys                 — Create API key
DEL  /api/keys                 — Delete API key
```

## Production

For production, replace SQLite with PostgreSQL:
1. Change `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma`
2. Update `prisma.config.ts` with your Postgres URL
3. Update `lib/prisma.ts` to use the Postgres adapter
4. Run `npx prisma migrate deploy`
