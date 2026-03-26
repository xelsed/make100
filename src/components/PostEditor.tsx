import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Plus, X, Github, Eye, Edit3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { addPost } from '@/lib/store';
import { fetchRepoMetadata } from '@/lib/github';
import { getCurrentUser } from '@/lib/store';
import { MOCK_POSTS } from '@/lib/mock-data';
import type { GitHubRepo } from '@/types';
import GitHubEmbed from './GitHubEmbed';

export default function PostEditor() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [repoUrl, setRepoUrl] = useState('');
  const [repoLoading, setRepoLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const nextDay = Math.max(...MOCK_POSTS.map(p => p.dayNumber), 0) + 1;

  function handleAddTag(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
      if (!tags.includes(tag)) {
        setTags([...tags, tag]);
      }
      setTagInput('');
    }
  }

  async function handleAddRepo() {
    if (!repoUrl.trim()) return;
    setRepoLoading(true);
    const meta = await fetchRepoMetadata(repoUrl);
    if (meta) {
      setRepos([...repos, meta]);
      setRepoUrl('');
    }
    setRepoLoading(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);

    addPost({
      userId: getCurrentUser().id,
      dayNumber: nextDay,
      title: title.trim(),
      content: content.trim(),
      tags,
      repos,
    });

    setTimeout(() => navigate('/'), 300);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="glass rounded-2xl p-6 space-y-5">
        {/* Day badge */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-600/20 border border-brand-500/30 text-brand-300 text-sm font-semibold">
            Day {nextDay}
          </span>
        </div>

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="What did you make today?"
          className="input-field w-full text-lg font-semibold"
          required
        />

        {/* Content editor / preview toggle */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              onClick={() => setPreview(false)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                !preview ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              Write
            </button>
            <button
              type="button"
              onClick={() => setPreview(true)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                preview ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Eye className="w-3 h-3" />
              Preview
            </button>
          </div>

          {preview ? (
            <div className="markdown-body min-h-[200px] p-4 glass rounded-xl">
              {content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              ) : (
                <p className="text-gray-600 italic">Nothing to preview yet...</p>
              )}
            </div>
          ) : (
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write about your experiment... (Markdown supported)"
              rows={12}
              className="input-field w-full font-mono text-sm resize-y"
              required
            />
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs font-medium text-gray-400 mb-1.5 block">Tags</label>
          <div className="flex flex-wrap items-center gap-1.5">
            {tags.map(tag => (
              <span key={tag} className="tag">
                #{tag}
                <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))}>
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add tag + Enter"
              className="bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none min-w-[100px] flex-1"
            />
          </div>
        </div>

        {/* GitHub Repos */}
        <div>
          <label className="text-xs font-medium text-gray-400 mb-1.5 block">Linked Repos</label>
          <div className="space-y-2 mb-2">
            {repos.map(repo => (
              <div key={repo.url} className="relative">
                <GitHubEmbed repo={repo} />
                <button
                  type="button"
                  onClick={() => setRepos(repos.filter(r => r.url !== repo.url))}
                  className="absolute top-2 right-2 p-1 rounded-full bg-gray-900/80 hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={repoUrl}
                onChange={e => setRepoUrl(e.target.value)}
                placeholder="https://github.com/user/repo"
                className="input-field w-full pl-9 text-sm"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRepo();
                  }
                }}
              />
            </div>
            <button
              type="button"
              onClick={handleAddRepo}
              disabled={repoLoading || !repoUrl.trim()}
              className="btn-ghost flex items-center gap-1.5 text-sm disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
              {repoLoading ? 'Loading...' : 'Add'}
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={!title.trim() || !content.trim() || submitting}
            className="btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Publishing...' : 'Publish Post'}
          </button>
        </div>
      </div>
    </form>
  );
}
