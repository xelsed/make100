# Experiment #1: Can AI Build & Ship a Website Before Midnight?

**Date:** March 25, 2026
**Start time:** 11:21 PM EDT
**Deadline:** 12:00 AM EDT (midnight)
**Time budget:** 39 minutes

## Hypothesis

An AI coding assistant can scaffold, build, and deploy a functional website in under 39 minutes — from first prompt to live URL.

## Setup

- **Project:** "100 Days in Making" — a daily experiment journal/feed app
- **Stack:** React 18, Vite, Tailwind CSS, TypeScript, Lucide icons, React Markdown
- **Deployment target:** TBD (Netlify or Cloudflare Pages)
- **AI tool:** Windsurf Cascade (coding assistant in IDE)
- **Another AI app** is writing the actual code; Cascade is tracking the experiment

## Timeline

| Time (EDT) | Elapsed | Event |
|---|---|---|
| 11:21 PM | 0:00 | Experiment started. Prompt sent to AI. |
| 11:22 PM | 0:01 | AI explored existing project structure — discovered app is already scaffolded with feed, post editor, detail pages, mock data, and routing. |
| 11:24 PM | 0:03 | Clarification: user has a separate AI app writing the code. This log is just tracking what happens. |
| 11:26 PM | 0:05 | Checked git status — no new code changes from the other AI app yet. Only this log file is new. Waiting for code to land. |
| 11:27 PM | 0:06 | Re-checked: still no new code changes. 16 source files unchanged. No new commits. 33 min remaining. |
| 11:28 PM | 0:07 | Fetched remote — no new code commits from the other AI app. Only experiment-log.md updates pushed. 32 min remaining. |
| 11:29 PM | 0:08 | **CODE LANDING!** 9 new files in `functions/` directory — full Cloudflare Pages Functions API backend. Also new `src/lib/api.ts` client. Backend includes: posts CRUD, comments, reactions, users, media upload, auth middleware. D1 database integration. |
| 11:30 PM | 0:09 | New file: `src/lib/auth.tsx` (auth context). Source files now at 18 (was 16). 3 untracked files: `functions/api/media.ts`, `src/lib/api.ts`, `src/lib/auth.tsx`. |
| 11:31 PM | 0:10 | New root files: `schema.sql` (D1 database schema) and `wrangler.toml` (Cloudflare Pages config). `tailwind.config.js` modified. Infrastructure taking shape. 29 min remaining. |
| 11:32 PM | 0:11 | `src/App.tsx` now modified — frontend routing being rewired (likely integrating auth context). Modified files: `App.tsx`, `tailwind.config.js`. Untracked: `media.ts`, `api.ts`, `auth.tsx`. 28 min remaining. |
| 11:33 PM | 0:12 | **Commit `b6b8444`** pushed: "wrap App with AuthProvider". All previously untracked files now committed. `index.html` being modified. 27 min remaining. |
| 11:34 PM | 0:13 | **2 new commits!** `0bd4443`: "feat: Phase 1 - Cloudflare foundation (D1 schema, Pages Functions API, auth, Dark Workshop theme)". `5002c39`: page title + color scheme update. Working tree is clean. 26 min remaining. |
| 11:36 PM | 0:15 | Quiet period — no new code changes. Other AI likely between phases. 24 min remaining. |
| 11:39 PM | 0:18 | Still quiet — ~5 min since Phase 1 commit. No new files or modifications. 18 src files stable. 21 min remaining. |
| 11:42 PM | 0:21 | **Activity resumes!** New file: `src/lib/url-detect.ts` (URL detection utility). 19 source files now. ~18 min remaining. |
| 11:46 PM | 0:25 | New file: `src/components/EmbedRenderer.tsx`. 20 source files now. URL detection + embed rendering being added. ~14 min remaining. |
| 11:50 PM | 0:29 | Quiet again — 20 src files stable, commit `15d0790` pushed (url-detect + EmbedRenderer). No new changes for ~4 min. ~10 min remaining. |
| 11:55 PM | 0:34 | Extended quiet — no new code for ~9 min. 20 src files, 9 backend functions files. App not yet deployed. ~5 min to deadline. |
| 11:57 PM | 0:36 | **Activity!** `PostEditor.tsx` modified — other AI updating the post editor component. ~3 min to midnight. |
| 11:59 PM | 0:38 | **Commit `e94c0b9`** pushed: "enhance PostEditor with media uploads, visibility, and multi-platform embeds". PostEditor upgraded with media upload, visibility controls, and embed support. Clean tree. ~1 min to midnight. |
| 12:00 AM | 0:39 | **MIDNIGHT.** Final state: 16 commits total, 41 project files, 20 frontend source files, 9 backend API files. App not deployed to a live URL. |

## Project State (as of 11:24 PM)

The repo already contains a working app structure:

- **Feed page** (`/`) — shows posts sorted by date or day, filterable by tag, with a progress bar
- **Post editor** (`/new`) — markdown editor with tag input, GitHub repo linking, and preview
- **Post detail** (`/post/:id`) — individual post view
- **3 sample posts** from mock users (LED matrix, clay printer, diffusion sketcher)
- **In-memory store** — posts, reactions, comments (no database yet)
- **Styled** with Tailwind + glassmorphism dark theme

### Files

```
src/
  App.tsx              — Router with 3 routes
  components/
    Layout.tsx         — Page shell
    PostCard.tsx       — Card for feed
    PostEditor.tsx     — Markdown post creator
    ReactionBar.tsx    — Emoji reactions
    GitHubEmbed.tsx    — Repo card embed
    UserAvatar.tsx     — Avatar component
  pages/
    Feed.tsx           — Main feed with sort/filter
    PostDetail.tsx     — Single post view
  lib/
    store.ts           — In-memory state + hooks
    mock-data.ts       — 3 sample posts, 3 users
    github.ts          — Repo metadata fetcher
  types/index.ts       — TypeScript interfaces
```

## Status

- [ ] Dependencies installed
- [ ] Dev server running
- [ ] User's experiment content written
- [ ] Production build
- [ ] Deployed to live URL
- [ ] Posted before midnight

## Result

**PARTIALLY COMPLETE.** The AI built a substantial full-stack application in 39 minutes but did **not** deploy it to a live URL before midnight.

### What was accomplished (in 39 min)

- **Full backend API** — 9 Cloudflare Pages Functions (posts CRUD, comments, reactions, users, media upload, auth middleware)
- **D1 database schema** (`schema.sql`) and **Cloudflare config** (`wrangler.toml`)
- **Auth system** — `src/lib/auth.tsx` context + API client (`src/lib/api.ts`)
- **Enhanced PostEditor** — media uploads, visibility controls, multi-platform embeds
- **New components** — `EmbedRenderer.tsx`, `url-detect.ts`
- **Theme update** — "Dark Workshop" color scheme, updated page title
- **16 commits** pushed to GitHub

### What was NOT accomplished

- **No live deployment** — no `npm run build` or `wrangler pages deploy` was run
- **No npm install** — dependencies were never installed locally
- **No dev server test** — the app was never actually run or verified working

### Final file count

- **41 total project files** (excluding node_modules and .git)
- **20 frontend source files** (up from original 16)
- **9 backend API files** (all new)
- **4 new utility/config files** (schema.sql, wrangler.toml, api.ts, auth.tsx)

### Verdict

The AI was **fast at writing code** (~13 min for the entire backend + infrastructure) but spent too long in quiet periods between phases (~14 min total idle). The critical missing step was deployment — had it prioritized shipping a minimal version first and iterating, it could have hit the deadline. The code exists but nobody can see it.
