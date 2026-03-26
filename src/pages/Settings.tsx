import { useState, useEffect } from 'react';
import { Save, Plus, X, Github, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import UserAvatar from '@/components/UserAvatar';

const PLATFORMS = [
  { id: 'github', label: 'GitHub', placeholder: 'username', icon: '🐙' },
  { id: 'instagram', label: 'Instagram', placeholder: '@username', icon: '📸' },
  { id: 'youtube', label: 'YouTube', placeholder: 'channel name or URL', icon: '🎬' },
  { id: 'discord', label: 'Discord', placeholder: 'username#0000 or server invite', icon: '💬' },
  { id: 'twitter', label: 'Twitter / X', placeholder: '@username', icon: '🐦' },
  { id: 'tiktok', label: 'TikTok', placeholder: '@username', icon: '🎵' },
  { id: 'arena', label: 'Are.na', placeholder: 'username', icon: '🔲' },
];

export default function Settings() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [accounts, setAccounts] = useState<any[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [addPlatform, setAddPlatform] = useState('');
  const [addUsername, setAddUsername] = useState('');
  const [addingAccount, setAddingAccount] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setGithubUsername(user.github_username || '');
    }
    loadAccounts();
  }, [user]);

  async function loadAccounts() {
    try {
      const res = await fetch('/api/accounts', {
        headers: import.meta.env.DEV ? { 'X-Dev-Email': 'dev@nyu.edu' } : {},
      });
      if (res.ok) setAccounts(await res.json());
    } catch { } finally {
      setLoadingAccounts(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await api.updateMe({ name, bio, github_username: githubUsername });
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { } finally {
      setSaving(false);
    }
  }

  async function handleAddAccount() {
    if (!addPlatform || !addUsername.trim()) return;
    setAddingAccount(true);
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(import.meta.env.DEV ? { 'X-Dev-Email': 'dev@nyu.edu' } : {}),
        },
        body: JSON.stringify({ platform: addPlatform, username: addUsername.trim() }),
      });
      if (res.ok) {
        await loadAccounts();
        setAddPlatform('');
        setAddUsername('');
      }
    } catch { } finally {
      setAddingAccount(false);
    }
  }

  async function handleRemoveAccount(platform: string) {
    try {
      await fetch(`/api/accounts?platform=${platform}`, {
        method: 'DELETE',
        headers: import.meta.env.DEV ? { 'X-Dev-Email': 'dev@nyu.edu' } : {},
      });
      setAccounts(accounts.filter(a => a.platform !== platform));
    } catch { }
  }

  const connectedPlatformIds = accounts.map(a => a.platform);
  const availablePlatforms = PLATFORMS.filter(p => !connectedPlatformIds.includes(p.id));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-extrabold gradient-text">Settings</h1>

      {/* Profile */}
      <form onSubmit={handleSaveProfile} className="glass rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-txt mb-2">Profile</h2>

        <div className="flex items-center gap-4 mb-4">
          {user && <UserAvatar user={user} size="lg" />}
          <div className="text-sm text-txt-secondary">{user?.email}</div>
        </div>

        <div>
          <label className="text-xs font-medium text-txt-secondary mb-1 block">Display Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="input-field w-full"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-txt-secondary mb-1 block">Bio</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            className="input-field w-full resize-y"
            rows={3}
            placeholder="What are you making?"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-txt-secondary mb-1 block">GitHub Username</label>
          <div className="relative">
            <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted" />
            <input
              type="text"
              value={githubUsername}
              onChange={e => setGithubUsername(e.target.value)}
              className="input-field w-full pl-9"
              placeholder="username"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2 text-sm disabled:opacity-40"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
          {saved && <span className="text-xs text-success">Saved!</span>}
        </div>
      </form>

      {/* Connected Accounts */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-txt mb-2">Connected Accounts</h2>
        <p className="text-xs text-txt-secondary mb-3">
          Link your accounts to easily embed content from these platforms in your posts.
        </p>

        {loadingAccounts ? (
          <Loader2 className="w-5 h-5 text-txt-muted animate-spin" />
        ) : (
          <>
            {accounts.length > 0 && (
              <div className="space-y-2 mb-4">
                {accounts.map((account: any) => {
                  const platform = PLATFORMS.find(p => p.id === account.platform);
                  return (
                    <div key={account.platform} className="flex items-center justify-between bg-surface-raised rounded-xl px-4 py-2.5 border border-white/[0.06]">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{platform?.icon || '🔗'}</span>
                        <div>
                          <span className="text-sm font-medium text-txt">{platform?.label || account.platform}</span>
                          <span className="text-xs text-txt-secondary ml-2">{account.username}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveAccount(account.platform)}
                        className="p-1 rounded-lg hover:bg-danger/10 text-txt-muted hover:text-danger transition-colors"
                        title="Disconnect"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {availablePlatforms.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <select
                  value={addPlatform}
                  onChange={e => setAddPlatform(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">Add platform...</option>
                  {availablePlatforms.map(p => (
                    <option key={p.id} value={p.id}>{p.icon} {p.label}</option>
                  ))}
                </select>

                {addPlatform && (
                  <>
                    <input
                      type="text"
                      value={addUsername}
                      onChange={e => setAddUsername(e.target.value)}
                      placeholder={PLATFORMS.find(p => p.id === addPlatform)?.placeholder || 'username'}
                      className="input-field flex-1 text-sm"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddAccount();
                        }
                      }}
                    />
                    <button
                      onClick={handleAddAccount}
                      disabled={addingAccount || !addUsername.trim()}
                      className="btn-primary text-sm flex items-center gap-1.5 disabled:opacity-40"
                    >
                      <Plus className="w-4 h-4" />
                      Connect
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
