import { useState, useEffect } from 'react';
import { Mail, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function Login() {
  const { login, refresh } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get('auth_error');
    if (authError) {
      setError(authError);
      window.history.replaceState({}, '', '/');
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');

    const result = await login(email.trim().toLowerCase());
    setLoading(false);

    if (!result.ok) {
      setError(result.error || 'Login failed');
    } else {
      setSent(true);
      if ((result as any).devLink) {
        setDevLink((result as any).devLink);
      }
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-lime/10 border border-lime/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-lime" />
          </div>
          <h1 className="text-xl font-bold text-txt mb-2">Check your email</h1>
          <p className="text-txt-secondary text-sm mb-6">
            We sent a magic link to <span className="text-txt font-medium">{email}</span>. Click it to log in.
          </p>
          <p className="text-[10px] text-txt-muted">Link expires in 15 minutes</p>

          {devLink && (
            <a
              href={devLink}
              className="block mt-4 text-xs text-lime underline underline-offset-2"
            >
              Dev mode: click here to verify
            </a>
          )}

          <button
            onClick={() => { setSent(false); setDevLink(null); }}
            className="mt-6 text-xs text-txt-muted hover:text-txt transition-colors"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-lime/10 border border-lime/20 flex items-center justify-center text-lime font-extrabold text-2xl mx-auto mb-4">
            100
          </div>
          <h1 className="text-2xl font-extrabold text-txt mb-1">100 Days in Making</h1>
          <p className="text-txt-secondary text-sm">Enter your email to get a magic login link</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
          <div>
            <label htmlFor="email" className="text-xs font-medium text-txt-secondary mb-1.5 block">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@nyu.edu"
                className="input-field w-full pl-10"
                required
                autoFocus
                autoComplete="email"
              />
            </div>
            <p className="text-[10px] text-txt-muted mt-1.5">Allowed: @nyu.edu emails or invited addresses</p>
          </div>

          {error && (
            <div className="text-danger text-sm bg-danger/10 border border-danger/20 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!email.trim() || loading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Send Magic Link
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[10px] text-txt-muted mt-6">m100.dev</p>
      </div>
    </div>
  );
}
