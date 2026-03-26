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

**TBD** — experiment in progress...
