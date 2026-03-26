import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Plus, X, Link as LinkIcon, Eye, Edit3, Upload, Globe, Lock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { detectUrl, isUrl } from '@/lib/url-detect';
import EmbedRenderer, { type MediaBlock } from './EmbedRenderer';

export default function PostEditor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dayNumber, setDayNumber] = useState(1);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [media, setMedia] = useState<MediaBlock[]>([]);
  const [linkInput, setLinkInput] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [visibility, setVisibility] = useState<'shared' | 'private'>('shared');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function handleAddLink() {
    const input = linkInput.trim();
    if (!input || !isUrl(input)) return;
    setLinkLoading(true);
    const detected = detectUrl(input);
    setMedia([...media, { type: detected.type, url: detected.url, meta: detected.meta }]);
    setLinkInput('');
    setLinkLoading(false);
  }

  const [uploading, setUploading] = useState(false);

  async function handleFileUpload(files: FileList | null) {
    if (!files) return;
    setUploading(true);
    setError(null);
    for (const file of Array.from(files)) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) continue;
      try {
        const result = await api.uploadMedia(file);
        const mediaType = result.mediaType || (isVideo ? 'video' : 'image');
        setMedia(prev => [...prev, {
          type: mediaType as any,
          url: result.url,
          alt: file.name,
          meta: { contentType: file.type, size: file.size },
        }]);
      } catch {
        setError(`Upload failed for ${file.name}`);
      }
    }
    setUploading(false);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  function removeMedia(index: number) {
    setMedia(media.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const post = await api.createPost({
        title: title.trim(),
        content: content.trim(),
        day_number: dayNumber,
        tags,
        media,
        visibility,
      });
      navigate(`/post/${post.id}`);
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="glass rounded-2xl p-6 space-y-5">
        {/* Day number + visibility */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Day</span>
            <input
              type="number"
              min={1}
              max={100}
              value={dayNumber}
              onChange={e => setDayNumber(parseInt(e.target.value) || 1)}
              className="w-16 input-field text-center text-sm font-bold text-lime font-mono"
            />
            <span className="text-xs text-gray-600">/ 100</span>
          </div>
          <button
            type="button"
            onClick={() => setVisibility(v => v === 'shared' ? 'private' : 'shared')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${visibility === 'shared'
              ? 'bg-success/10 text-success border border-success/20'
              : 'bg-warm/10 text-warm border border-warm/20'
              }`}
          >
            {visibility === 'shared' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
            {visibility === 'shared' ? 'Shared' : 'Private'}
          </button>
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

        {/* Write / Preview toggle */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              onClick={() => setPreview(false)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${!preview ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              <Edit3 className="w-3 h-3" />
              Write
            </button>
            <button
              type="button"
              onClick={() => setPreview(true)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${preview ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
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
            <div
              className={`relative ${dragOver ? 'ring-2 ring-lime/40 ring-offset-2 ring-offset-base' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={() => setDragOver(false)}
            >
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Write about your experiment... (Markdown supported, drag images here)"
                rows={12}
                className="input-field w-full font-mono text-sm resize-y"
                required
              />
              {dragOver && (
                <div className="absolute inset-0 bg-lime/5 border-2 border-dashed border-lime/30 rounded-xl flex items-center justify-center pointer-events-none">
                  <span className="text-lime font-medium text-sm">Drop image here</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Media blocks */}
        {media.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400">Attached Media</label>
            {media.map((block, i) => (
              <div key={i} className="relative group">
                <EmbedRenderer block={block} />
                <button
                  type="button"
                  onClick={() => removeMedia(i)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-gray-900/80 hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add link / image */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400">Add Link or Image</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={linkInput}
                onChange={e => setLinkInput(e.target.value)}
                placeholder="Paste any URL (GitHub, YouTube, Instagram, Discord...)"
                className="input-field w-full pl-9 text-sm"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddLink();
                  }
                }}
              />
            </div>
            <button
              type="button"
              onClick={handleAddLink}
              disabled={linkLoading || !linkInput.trim()}
              className="btn-ghost flex items-center gap-1.5 text-sm disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-ghost flex items-center gap-1.5 text-sm"
              title="Upload image"
            >
              <Upload className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={e => handleFileUpload(e.target.files)}
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs font-medium text-gray-400 mb-1.5 block">Tags</label>
          <div className="flex flex-wrap items-center gap-1.5">
            {tags.map(tag => (
              <span key={tag} className="tag">
                #{tag}
                <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} title="Remove tag">
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

        {/* Error */}
        {error && (
          <div className="text-danger text-sm bg-danger/10 border border-danger/20 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

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
