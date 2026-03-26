-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT DEFAULT NULL,
  bio TEXT DEFAULT '',
  github_username TEXT DEFAULT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  visibility TEXT NOT NULL DEFAULT 'shared',
  tags TEXT NOT NULL DEFAULT '[]',
  media TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_day_number ON posts(day_number);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_user_day ON posts(user_id, day_number);

-- Reactions table
CREATE TABLE IF NOT EXISTS reactions (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reactions_post_id ON reactions(post_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_reactions_unique ON reactions(post_id, user_id, emoji);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);

-- Connected accounts table
CREATE TABLE IF NOT EXISTS connected_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  username TEXT NOT NULL,
  config TEXT NOT NULL DEFAULT '{}',
  connected_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_connected_accounts_user_id ON connected_accounts(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_connected_accounts_unique ON connected_accounts(user_id, platform);

-- Magic link tokens
CREATE TABLE IF NOT EXISTS magic_tokens (
  token TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0
);

-- Invited emails (individual invites beyond domain whitelist)
CREATE TABLE IF NOT EXISTS invited_emails (
  email TEXT PRIMARY KEY,
  invited_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
