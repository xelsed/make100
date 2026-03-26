# make100

**A private, multi-user daily experiment journal for 100-day creative challenges.**

Live at [m100.dev](https://m100.dev)

---

## What is this?

make100 is a web app where a group of makers each document one experiment per day for 100 days. Each person owns their own timeline. The feed is shared. Nobody needs to install anything — just enter your email, click the magic link, and start posting.

Built for [NYU ITP](https://itp.nyu.edu) as a tool for structured creative accountability.

![Midnight Workshop theme](https://img.shields.io/badge/theme-Midnight_Workshop-84cc16?style=flat-square&labelColor=09090b)
![Cloudflare Pages](https://img.shields.io/badge/deploy-Cloudflare_Pages-f38020?style=flat-square&labelColor=09090b)
![D1 + R2](https://img.shields.io/badge/data-D1_%2B_R2-f38020?style=flat-square&labelColor=09090b)

---

## Features

- **Magic link auth** — enter your email, get a login link. No passwords. Access gated by email domain (`@nyu.edu`) or individual invite.
- **Daily post editor** — markdown with live preview, day number selector (1–100), shared/private visibility toggle.
- **Media uploads** — drag-and-drop images and videos (up to 500MB). Stored in Cloudflare R2, served at the edge.
- **Smart URL embeds** — paste a URL and it auto-detects the platform:
  - GitHub → repo card with language, stars
  - YouTube / Vimeo / Loom → inline video player
  - Instagram / Twitter / TikTok / Discord / Are.na → branded embed card
  - Any URL → Open Graph preview
- **Multi-user** — anyone with an allowed email can sign up. Each user manages their own 100-day timeline. The homepage adapts: 1 user → personal dashboard, 2+ users → shared welcome center with maker grid.
- **Reactions + comments** — emoji reactions and threaded comments on every post.
- **Connected accounts** — link GitHub, Instagram, Discord, YouTube, Twitter, TikTok, Are.na from the settings page.
- **Tags + filtering** — tag experiments, filter the feed.
- **Progress tracker** — visual bar showing N/100 days completed.
- **Midnight Workshop theme** — deep navy background (`#09090b`), electric lime accent (`#84cc16`), layered surfaces with generous spacing. Designed to feel like a late-night maker space, not a generic dashboard.

---

## Architecture

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| Backend | Cloudflare Pages Functions (edge) |
| Database | Cloudflare D1 (SQLite) |
| File storage | Cloudflare R2 |
| Auth | Magic link email via [Resend](https://resend.com) + HMAC-signed session cookies |
| Email | Resend API, sending from `noreply@m100.dev` |

---

## Project Structure

```
make100/
├── src/                    # React frontend
│   ├── components/         # PostCard, PostEditor, EmbedRenderer, Layout, etc.
│   ├── pages/              # Feed, PostDetail, Settings, Login
│   └── lib/                # API client, auth context, URL detection, GitHub util
├── functions/              # Cloudflare Pages Functions (API)
│   └── api/
│       ├── _middleware.ts  # Auth middleware (session cookie verification)
│       ├── auth/           # login, logout, verify (magic link)
│       ├── posts.ts        # CRUD for posts
│       ├── posts/[id].ts   # Single post operations
│       ├── posts/[id]/     # reactions.ts, comments.ts
│       ├── me.ts           # Current user profile
│       ├── users.ts        # List all users
│       ├── accounts.ts     # Connected accounts CRUD
│       ├── media.ts        # File upload to R2
│       └── media/[[path]].ts # Serve files from R2
├── schema.sql              # D1 database schema
├── wrangler.toml           # Cloudflare configuration
└── tailwind.config.js      # Midnight Workshop color system
```

---

## Local Development

```bash
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`. API calls proxy to `localhost:8788` (run `npx wrangler pages dev dist` in a second terminal for the backend).

In dev mode, the login page shows a clickable magic link directly instead of sending email.

---

## Deployment

Deployed on Cloudflare Pages with D1 (database) and R2 (file storage).

```bash
# Build
npm run build

# Deploy
npx wrangler pages deploy dist --project-name=make100

# Run database migrations
npx wrangler d1 execute make100-db --file=./schema.sql --remote
```

### Secrets

```bash
npx wrangler pages secret put RESEND_API_KEY --project-name=make100
npx wrangler pages secret put SESSION_SECRET --project-name=make100
```

---

## Database

Six tables — see [`schema.sql`](./schema.sql) for full definitions.

- `users` — email, name, avatar, bio, github username
- `posts` — day number, title, markdown content, tags (JSON), media blocks (JSON), visibility
- `reactions` — emoji reactions per post per user
- `comments` — threaded comments on posts
- `connected_accounts` — linked platform accounts (GitHub, Instagram, Discord, etc.)
- `magic_tokens` — magic link tokens with 15-minute expiry
- `invited_emails` — individual email invites beyond domain whitelist

---

## License

Copyright 2026. All rights reserved. This project is not open source. No part of this codebase may be reproduced, distributed, or used without explicit written permission from the author.
