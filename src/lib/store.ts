import { useState, useEffect } from 'react';
import type { Post, Reaction, Comment, User } from '@/types';
import { MOCK_POSTS, MOCK_USERS, CURRENT_USER } from './mock-data';

let postsCache = [...MOCK_POSTS];
let listeners: Array<() => void> = [];

function notify() {
  listeners.forEach(fn => fn());
}

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>(postsCache);

  useEffect(() => {
    const listener = () => setPosts([...postsCache]);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  return posts;
}

export function addPost(post: Omit<Post, 'id' | 'user' | 'reactions' | 'comments' | 'createdAt' | 'updatedAt'>) {
  const newPost: Post = {
    ...post,
    id: `p${Date.now()}`,
    user: CURRENT_USER,
    reactions: [],
    comments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  postsCache = [newPost, ...postsCache];
  notify();
  return newPost;
}

export function addReaction(postId: string, emoji: string) {
  const reaction: Reaction = {
    id: `r${Date.now()}`,
    postId,
    userId: CURRENT_USER.id,
    emoji,
    createdAt: new Date().toISOString(),
  };
  postsCache = postsCache.map(p =>
    p.id === postId
      ? { ...p, reactions: [...p.reactions, reaction] }
      : p
  );
  notify();
}

export function removeReaction(postId: string, emoji: string) {
  postsCache = postsCache.map(p =>
    p.id === postId
      ? {
        ...p,
        reactions: p.reactions.filter(
          r => !(r.userId === CURRENT_USER.id && r.emoji === emoji)
        ),
      }
      : p
  );
  notify();
}

export function addComment(postId: string, content: string) {
  const comment: Comment = {
    id: `c${Date.now()}`,
    postId,
    userId: CURRENT_USER.id,
    user: CURRENT_USER,
    content,
    createdAt: new Date().toISOString(),
  };
  postsCache = postsCache.map(p =>
    p.id === postId
      ? { ...p, comments: [...p.comments, comment] }
      : p
  );
  notify();
}

export function getUsers(): User[] {
  return MOCK_USERS;
}

export function getCurrentUser(): User {
  return CURRENT_USER;
}
