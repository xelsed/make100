# make100 — Deployment Tracker

## Current Deployment

- **URL:** <https://make100.pages.dev>
- **Preview:** <https://4a68c691.make100.pages.dev>
- **Platform:** Cloudflare Pages + Functions
- **Domain:** m100.dev *(custom domain not yet configured)*
- **Database:** Cloudflare D1 — `make100-db` (`0dc70598-cff5-4ceb-82b5-b7344590b9e9`)
- **Storage:** Cloudflare R2 — `make100-media`
- **Auth:** Cloudflare Access *(not yet configured — see step 5 below)*

---

## Deployment Log

### Deploy #1 — 2026-03-26 ~04:03 UTC

**Status:** Deployed to <https://4a68c691.make100.pages.dev>

**What was deployed:**

- React frontend (Vite build)
- Cloudflare Pages Functions (API at `/api/*`)
- D1 database with schema migrated
- R2 bucket created for media uploads
- SPA `_redirects` for client-side routing

**Pre-deploy fixes applied:**

| # | Fix | File(s) |
|---|-----|---------|
| 1 | **Disabled `X-Dev-Email` in production** — dev auth header gated to localhost only | `functions/api/_middleware.ts` |
| 2 | **Added SPA fallback** — `/* /index.html 200` | `public/_redirects` |
| 3 | **Fixed ReactionBar stale props** — `useEffect` syncs when parent re-fetches | `src/components/ReactionBar.tsx` |
| 4 | **Added file type validation on upload** — JPEG, PNG, GIF, WebP, SVG only | `functions/api/media.ts` |
| 5 | **Fixed accounts UPSERT returning wrong ID** — re-reads row after upsert | `functions/api/accounts.ts` |
| 6 | **Added CORS headers to 401/403 responses** | `functions/api/_middleware.ts` |
| 7 | **Sanitized tag LIKE pattern** — strips `%`, `_`, `"`, `\` | `functions/api/posts.ts` |
| 8 | **Separated users fetch from tag filter** — users fetched once on mount | `src/pages/Feed.tsx` |
| 9 | **Fixed dead `@/types` import in github.ts** — inlined interface | `src/lib/github.ts` |

---

## Post-Deploy: Still Needed

### Required for Production Use

1. **Configure Cloudflare Access**
   - Go to Cloudflare Zero Trust dashboard
   - Create an Access application for `m100.dev` (or `make100.pages.dev` for now)
   - Add policy: allow emails matching `*@nyu.edu` and `*@itp.nyu.edu`
   - Ensure the policy covers both the site and `/api/*` routes

2. **Set custom domain `m100.dev`**
   - In Cloudflare Pages project settings → Custom domains → Add `m100.dev`
   - Point DNS to Cloudflare

### Nice to Have

- **JWT signature verification** — middleware decodes but doesn't verify the `CF-Access-Jwt-Assertion` signature. Currently relies on Access being the sole entry point.
- **Markdown truncation** — `PostCard` slices at 400 chars, can break mid-syntax. Cosmetic.
- **Dead code cleanup** — `src/lib/store.ts`, `src/lib/mock-data.ts`, `src/components/GitHubEmbed.tsx`, `src/types/index.ts` are unused legacy files.

---

## Redeployment

```bash
npm run build
npx wrangler pages deploy dist --project-name=make100
```

## Database Migration

```bash
npx wrangler d1 execute make100-db --file=./schema.sql --remote
```
