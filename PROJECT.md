# m100.dev — 100 Days in Making

**Live:** [m100.dev](https://m100.dev) | **Code:** [github.com/xelsed/make100](https://github.com/xelsed/make100)

---

## What I Built

A full-stack web app for documenting daily creative experiments over 100 days. It's a multi-user platform where each maker logs one experiment per day — code, video, images, links — and the feed is publicly viewable so you can share individual posts as links.

I built this in ~3 hours using AI-assisted development (Windsurf + Claude) as an experiment in how fast you can go from idea to deployed product with modern AI tools.

---

## Stack

- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS
- **Backend:** Cloudflare Pages Functions (serverless edge API)
- **Database:** Cloudflare D1 (SQLite at the edge)
- **File Storage:** Cloudflare R2 (images + video up to 500MB)
- **Auth:** Magic link email (Resend API) + HMAC-signed session cookies
- **Domain:** [m100.dev](https://m100.dev)

No external servers. No Docker. No traditional database. Everything runs on Cloudflare's edge network.

---

## Key Features

- **Magic link login** — no passwords, email-domain gated (`@nyu.edu`)
- **Markdown post editor** with live preview, day selector (1-100), visibility toggle (public/private)
- **Smart URL embeds** — paste a GitHub, YouTube, Instagram, Discord, Twitter, or any URL and it auto-renders the right embed
- **Video + image uploads** — drag-and-drop, stored in R2, served at the edge
- **Multi-user** — each person owns their timeline, shared feed shows everyone's work
- **Public viewing** — post links are shareable (no login needed to read)
- **Reactions + comments** on every post
- **Connected accounts** — link GitHub, Instagram, Discord, YouTube, Twitter, TikTok, Are.na
- **Midnight Workshop theme** — custom dark UI with electric lime accent, designed from 2026 UI color trend research

---

## Architecture Diagram

```
Browser ──→ Cloudflare Pages (static React app)
              │
              ├── /api/* ──→ Pages Functions (edge workers)
              │                 │
              │                 ├── D1 (SQLite database)
              │                 ├── R2 (file storage)
              │                 └── Resend (email API)
              │
              └── /api/media/* ──→ R2 (serve uploaded files)
```

---

## What I Learned

- Cloudflare's D1 + R2 + Pages Functions stack is a legitimate full-stack platform with zero ops
- Magic link auth is surprisingly simple to implement (token table + email API + signed cookies)
- TailwindCSS `@apply` doesn't work with custom color tokens that have DEFAULT keys — you have to use plain CSS
- Resend's free tier only sends to the account owner's email — need to verify your domain first
- `git filter-branch` still works for removing large files from history but takes 10+ minutes on 47 commits

---

## Process

This was built as a "100 Days in Making" experiment — Day 1 was building the tool itself. The entire app was designed, planned, coded, audited, redesigned (twice — the first color theme was too generic), debugged, and deployed in a single session using AI pair programming.

The [full plan](https://github.com/xelsed/make100/blob/main/.windsurf/plans/100days-in-making-plan-6e1f29.md) is in the repo if you want to see the design document.
