# Whatever Generative AI is Doing — Week 1

## m100.dev: Building a 100-Day Experiment Journal with AI

**Live site:** [m100.dev](https://m100.dev)
**Source code:** [github.com/xelsed/make100](https://github.com/xelsed/make100)

---

## The Experiment

For my week 1 homework, I wanted to explore how far AI-assisted development can go in a single session. Instead of cloning an existing open source project, I used AI (Windsurf + Claude) to build one from scratch — a full-stack web application called **make100**, deployed to a live domain at [m100.dev](https://m100.dev).

The idea: a private, multi-user daily experiment journal where a group of makers each document one experiment per day for 100 days. Think of it like a shared lab notebook for creative technologists — each person owns their own timeline, but the feed is shared and publicly viewable so you can drop a link in Discord and anyone can read your post.

This project IS the first experiment. Day 1 of 100 was building the tool that tracks the other 99.

---

## What I Built

**make100** is a full-stack web app with:

- **Magic link email auth** — no passwords. You enter your `@nyu.edu` email, get a login link, click it, you're in. Access is gated by email domain so only NYU people can post, but anyone can read.
- **A daily post editor** — write in markdown with live preview. Pick your day number (1–100). Toggle between public and private. Attach media.
- **Image and video uploads** — drag-and-drop files up to 500MB (for screen recordings). Everything is stored on Cloudflare R2 and served at the edge.
- **Smart URL embeds** — paste a GitHub repo link and it auto-renders a rich card with the language, stars, and description. Same for YouTube (inline player), Instagram, Twitter, Discord, TikTok, Are.na, and any URL (Open Graph preview).
- **Multi-user support** — anyone with an allowed email can sign up and get their own 100-day timeline. The homepage adapts: one user gets a personal dashboard, multiple users get a shared welcome center with a maker grid.
- **Public post viewing** — individual post URLs are shareable. No login needed to read. So I can drop `m100.dev/post/abc123` in Discord and everyone can see it.
- **Reactions and comments** — emoji reactions and threaded comments on every post.
- **A custom dark theme called "Midnight Workshop"** — deep navy background with an electric lime accent. I researched 2026 UI color trends and intentionally avoided the generic warm-orange palettes that AI tools tend to default to.

---

## The Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 18 + TypeScript + Vite + TailwindCSS | Fast dev, component model, utility CSS |
| Backend | Cloudflare Pages Functions | Serverless edge API, zero ops |
| Database | Cloudflare D1 (SQLite) | SQL at the edge, free tier |
| File storage | Cloudflare R2 | S3-compatible object storage, free egress |
| Auth | Resend API + HMAC-signed cookies | Magic link emails from `noreply@m100.dev` |
| Domain | m100.dev | Short, memorable |

No traditional servers. No Docker. No AWS. Everything runs on Cloudflare's edge network. The entire backend is ~600 lines of TypeScript across 10 API endpoint files.

---

## The Process

The whole thing was built in roughly 3 hours in a single late-night session. Here's what happened:

1. **Started with a question** — what platform should I use for a 100-day blog? I explored Tumblr, GitHub Pages, Notion, Netlify, Cloudflare. Ended up deciding to build something custom because none of the existing options had the right combination of privacy control + easy posting + not being a pain.

2. **Wrote a full design plan** — before writing any code, I had Claude help me create a detailed plan covering the color theme, UX flow, information architecture, data model, API design, and implementation phases. That plan is [in the repo](https://github.com/xelsed/make100/blob/main/.windsurf/plans/100days-in-making-plan-6e1f29.md).

3. **Built in phases** — Foundation (Cloudflare config, database schema, auth middleware, API endpoints) → Post editor with smart URL embeds → Feed and timeline → Settings and connected accounts → Polish and deployment.

4. **Redesigned the theme twice** — the first version used a generic coral/amber palette that looked like every other AI-generated dark mode. I searched the web for 2026 UI color trends, found that hyper-saturated single-accent dark themes are the move, and switched to deep navy + electric lime. Much more distinctive.

5. **Hit real bugs** — Tailwind's `@apply` directive doesn't work with custom color tokens that have `DEFAULT` keys. Resend's free tier can only send emails to the account owner. A 498MB screen recording got committed to git and blocked pushing. React's StrictMode double-fires `useEffect` which caused an infinite API retry loop. Each one required a real fix.

6. **Deployed and iterated** — went through ~10 deployments, fixing issues as they came up in production. The auth system evolved from Cloudflare Zero Trust (too complex) → simple email check (not secure enough) → magic link emails (just right).

---

## What I Learned About AI-Assisted Development

- **AI is very good at scaffolding** — generating boilerplate, setting up project structure, writing CRUD endpoints. The first 80% goes fast.
- **AI is mediocre at design** — the default color choices are generic. You have to push it with specific references and reject the first suggestion.
- **AI makes real bugs** — unused imports, stale closures, missing try/catch, wrong CSS syntax. You still need to read the code.
- **The last 20% takes 80% of the time** — auth edge cases, CDN caching, email deliverability, cookie settings. These are production problems that AI can help debug but can't avoid.
- **The planning phase matters most** — the design plan document was the highest-leverage thing I created. It gave the AI clear constraints to work within.

---

## Try It

- **Read the feed:** [m100.dev](https://m100.dev) (no login needed)
- **Browse the code:** [github.com/xelsed/make100](https://github.com/xelsed/make100)
- **See the design plan:** [100days-in-making-plan](https://github.com/xelsed/make100/blob/main/.windsurf/plans/100days-in-making-plan-6e1f29.md)
