export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio: string;
  githubUsername: string;
  isOnline: boolean;
  joinedAt: string;
}

export interface GitHubRepo {
  url: string;
  name: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  updatedAt: string;
}

export interface Post {
  id: string;
  userId: string;
  user: User;
  dayNumber: number;
  title: string;
  content: string;
  tags: string[];
  repos: GitHubRepo[];
  reactions: Reaction[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Reaction {
  id: string;
  postId: string;
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: User;
  content: string;
  createdAt: string;
}

export interface PartyMessage {
  type: 'new-post' | 'new-reaction' | 'new-comment' | 'presence-update' | 'typing';
  payload: unknown;
  userId: string;
  timestamp: string;
}
