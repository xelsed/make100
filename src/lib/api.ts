const API_BASE = '/api';

const DEV_EMAIL = 'dev@nyu.edu';

function getHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (import.meta.env.DEV) {
    headers['X-Dev-Email'] = DEV_EMAIL;
  }
  return headers;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...options?.headers },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((body as any).error || `Request failed: ${res.status}`);
  }

  return res.json();
}

// Auth / User
export const api = {
  getMe: () => request<any>('/me'),
  updateMe: (data: Record<string, unknown>) =>
    request<any>('/me', { method: 'PUT', body: JSON.stringify(data) }),

  getUsers: () => request<any[]>('/users'),

  // Posts
  getPosts: (params?: { user_id?: string; tag?: string; cursor?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.user_id) qs.set('user_id', params.user_id);
    if (params?.tag) qs.set('tag', params.tag);
    if (params?.cursor) qs.set('cursor', params.cursor);
    if (params?.limit) qs.set('limit', String(params.limit));
    const query = qs.toString();
    return request<{ posts: any[]; nextCursor: string | null }>(`/posts${query ? `?${query}` : ''}`);
  },

  getPost: (id: string) => request<any>(`/posts/${id}`),

  createPost: (data: {
    title: string;
    content: string;
    day_number: number;
    tags?: string[];
    media?: any[];
    visibility?: 'shared' | 'private';
  }) => request<any>('/posts', { method: 'POST', body: JSON.stringify(data) }),

  updatePost: (id: string, data: Record<string, unknown>) =>
    request<any>(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deletePost: (id: string) =>
    request<{ ok: boolean }>(`/posts/${id}`, { method: 'DELETE' }),

  // Reactions
  toggleReaction: (postId: string, emoji: string) =>
    request<{ toggled: string; emoji: string }>(`/posts/${postId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    }),

  // Comments
  getComments: (postId: string) => request<any[]>(`/posts/${postId}/comments`),

  addComment: (postId: string, content: string) =>
    request<any>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  // Media upload
  uploadMedia: async (file: File): Promise<{ url: string; key: string; mediaType?: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    if (import.meta.env.DEV) {
      headers['X-Dev-Email'] = DEV_EMAIL;
    }

    const res = await fetch(`${API_BASE}/media`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },
};
