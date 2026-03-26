# 100 Days in Making

A clean, private blog for documenting daily experiments and builds. Features markdown posts, GitHub repo embeds, reactions, and comments.

## Local Development

```bash
npm install
npm run dev
```

## Deploy to Netlify (with Password Protection)

### Option A: Deploy from this directory

1. Install the Netlify CLI: `npm install -g netlify-cli`
2. Build the site: `npm run build`
3. Deploy: `netlify deploy --prod --dir=dist`
4. Follow the prompts to link or create a site

### Option B: Connect a GitHub repo

1. Push this project to a **private** GitHub repo
2. Go to [app.netlify.com](https://app.netlify.com) → "Add new site" → "Import from Git"
3. Connect your repo
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Deploy

### Enable Password Protection

1. Go to your Netlify site dashboard
2. **Site configuration** → **Access & security** → **Visitor access**
3. Set a **site-wide password**
4. Share the password with people you trust

Now anyone visiting your site will see a password prompt first.

### Alternative: Cloudflare Pages + Access (email-based)

If you want to restrict access to `@nyu.edu` emails instead of a shared password:

1. Deploy to Cloudflare Pages (similar git-based workflow)
2. In Cloudflare dashboard → **Zero Trust** → **Access** → **Applications**
3. Add your Pages domain
4. Create a policy: **Allow** → **Emails ending in** → `@nyu.edu`
5. Users verify via a one-time email code — no passwords needed

## Posting Workflow

Currently, posts are stored in-memory with mock data. To add real persistence, you can:

1. **Add a backend** (Cloudflare D1, Supabase, etc.)
2. **Use markdown files** — add `.md` files to a `posts/` directory and build a simple loader
3. **Use the GitHub API** — store posts as issues or files in a repo

## Tech Stack

- **React 18** + TypeScript
- **Vite** for dev/build
- **TailwindCSS** for styling
- **React Router** for navigation
- **React Markdown** for post rendering
- **Lucide** for icons
- **date-fns** for date formatting
