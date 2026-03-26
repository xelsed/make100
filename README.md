# make100 — m100.dev

A private, multi-user daily experiment journal. Each person is their own admin for their 100-day projects, with email-domain gating, cross-platform content aggregation, and frictionless daily posting.

## Architecture

- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS
- **Backend:** Cloudflare Pages Functions (edge API)
- **Database:** Cloudflare D1 (SQLite at the edge)
- **File Storage:** Cloudflare R2 (image uploads)
- **Auth:** Cloudflare Access (email-domain gating, e.g. `@nyu.edu`)
- **Domain:** `m100.dev`

## Local Development

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:5173`. In development, API requests use a mock `X-Dev-Email: dev@nyu.edu` header for auth.

## Deploy to Cloudflare Pages

### 1. Create Cloudflare resources

```bash
# Create D1 database
npx wrangler d1 create make100-db
# Copy the database_id into wrangler.toml

# Create R2 bucket
npx wrangler r2 bucket create make100-media

# Run database migrations
npx wrangler d1 execute make100-db --file=./schema.sql
```

### 2. Deploy

```bash
npm run build
npx wrangler pages deploy dist
```

### 3. Configure Cloudflare Access (email-domain gating)

1. Go to Cloudflare dashboard → **Zero Trust** → **Access** → **Applications**
2. Add your Pages domain (`m100.dev` or `*.pages.dev`)
3. Create a policy: **Allow** → **Emails ending in** → `nyu.edu`
4. Users verify via a one-time email code — no passwords needed

### 4. Custom domain

1. In Cloudflare Pages → your project → **Custom domains**
2. Add `m100.dev`
3. DNS records are configured automatically if your domain is on Cloudflare

## Features

- **Daily post editor** — markdown + write/preview toggle + day number selector
- **Smart URL detection** — paste any URL and it auto-detects the platform:
  - GitHub repos → rich card with language, stars, forks
  - YouTube / Vimeo / Loom → inline video player
  - Instagram / Twitter / TikTok / Discord / Are.na → platform-branded embed card
  - Any other URL → Open Graph link preview
- **Image upload** — drag-and-drop or click to upload, stored in R2
- **Visibility control** — shared (all authenticated users) or private (only you)
- **Reactions** — emoji reactions with toggle
- **Comments** — threaded comments on each post
- **Connected accounts** — link GitHub, Instagram, Discord, YouTube, Twitter, TikTok, Are.na
- **Tag system** — filter posts by tag
- **Progress bar** — visual N/100 days tracker
- **Dark Workshop theme** — near-black background, coral/amber accents, glassmorphism cards
- **Email-domain gating** — only `@nyu.edu` (configurable) can access

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/me` | Current user profile |
| PUT | `/api/me` | Update profile |
| GET | `/api/users` | List all users |
| GET | `/api/posts` | List posts (supports `?user_id`, `?tag`, `?cursor`, `?limit`) |
| POST | `/api/posts` | Create post |
| GET | `/api/posts/:id` | Get post with reactions + comments |
| PUT | `/api/posts/:id` | Update own post |
| DELETE | `/api/posts/:id` | Delete own post |
| POST | `/api/posts/:id/reactions` | Toggle reaction |
| GET | `/api/posts/:id/comments` | List comments |
| POST | `/api/posts/:id/comments` | Add comment |
| POST | `/api/media` | Upload file to R2 |
| GET | `/api/accounts` | List connected accounts |
| POST | `/api/accounts` | Add/update connected account |
| DELETE | `/api/accounts?platform=x` | Remove connected account |

## Database Schema

See `schema.sql` for the full schema. Tables: `users`, `posts`, `reactions`, `comments`, `connected_accounts`.
