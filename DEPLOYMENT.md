# make100 — Deployment Tracker

## Deployment Target
- **Platform:** Cloudflare Pages + Functions
- **Domain:** m100.dev
- **Database:** Cloudflare D1 (`make100-db`)
- **Storage:** Cloudflare R2 (`make100-media`)
- **Auth:** Cloudflare Access (email-domain gating)

---

## Pre-Deploy Fixes Applied (2026-03-25)

| # | Fix | File(s) | Status |
|---|-----|---------|--------|
| 1 | **Disabled `X-Dev-Email` in production** — dev auth header now gated behind `DEV_MODE` env var (only set in `[env.dev.vars]`) | `functions/api/_middleware.ts`, `wrangler.toml` | Done |
| 2 | **Added SPA fallback** — `public/_redirects` with `/* /index.html 200` so client-side routes work on refresh | `public/_redirects` | Done |
| 3 | **Fixed ReactionBar stale props** — added `useEffect` to sync when parent passes new reactions | `src/components/ReactionBar.tsx` | Done |
| 4 | **Added file type validation on upload** — only JPEG, PNG, GIF, WebP, SVG accepted | `functions/api/media.ts` | Done |
| 5 | **Fixed accounts UPSERT returning wrong ID** — re-reads row after upsert to return actual DB state | `functions/api/accounts.ts` | Done |
| 6 | **Added CORS headers to 401/403 responses** — error responses now include `Access-Control-Allow-Origin` | `functions/api/_middleware.ts` | Done |
| 7 | **Sanitized tag filter LIKE pattern** — strips `%`, `_`, `"`, `\` from user input | `functions/api/posts.ts` | Done |
| 8 | **Separated users fetch from tag filter** — users fetched once on mount, posts re-fetched per tag change | `src/pages/Feed.tsx` | Done |

---

## Deployment Steps

### 1. Create Cloudflare Resources
```bash
# Create D1 database
wrangler d1 create make100-db
# Copy the database_id from the output and update wrangler.toml

# Create R2 bucket
wrangler r2 bucket create make100-media
```

### 2. Update `wrangler.toml`
Replace `database_id = "placeholder-create-with-wrangler-d1-create"` with the real UUID from step 1.

### 3. Run Database Migration
```bash
npm run db:migrate
# or: wrangler d1 execute make100-db --file=./schema.sql
```

### 4. Build & Deploy
```bash
npm run build
wrangler pages deploy dist
```

### 5. Configure Cloudflare Access
1. Go to Cloudflare Zero Trust dashboard
2. Create an Access application for `m100.dev`
3. Add policy: allow emails matching `*@nyu.edu` and `*@itp.nyu.edu`
4. Ensure the policy covers both the site and `/api/*` routes

### 6. Set Custom Domain
1. In Cloudflare Pages project settings, add `m100.dev` as custom domain
2. Verify DNS is pointed correctly

---

## Environment Variables

| Var | Production | Dev |
|-----|-----------|-----|
| `ALLOWED_DOMAINS` | `nyu.edu,itp.nyu.edu` | `nyu.edu,itp.nyu.edu` |
| `DEV_MODE` | *(not set)* | `true` |

---

## Known Remaining Items

- **JWT signature not verified** — middleware decodes but doesn't verify `CF-Access-Jwt-Assertion` signature. Relies on Cloudflare Access being the sole entry point. Consider adding signature verification against `https://<team>.cloudflareaccess.com/cdn-cgi/access/certs` for defense-in-depth.
- **Markdown truncation** — `PostCard` slices content at 400 chars which can break mid-syntax. Low priority, cosmetic only.
- **Dead code cleanup** — `src/lib/store.ts`, `src/lib/mock-data.ts`, `src/components/GitHubEmbed.tsx`, `src/types/index.ts` are from the mock-data era and no longer used. Safe to remove.
