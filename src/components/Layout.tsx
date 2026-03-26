import { Link, useLocation } from 'react-router-dom';
import { Home, PenSquare, Loader2, Settings, LogOut, LogIn } from 'lucide-react';
import UserAvatar from './UserAvatar';
import { useAuth } from '@/lib/auth';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-lime/10 border border-lime/20 flex items-center justify-center text-lime font-extrabold text-lg mb-4 mx-auto animate-glow">
            100
          </div>
          <Loader2 className="w-5 h-5 text-txt-muted animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-lime/10 border border-lime/20 flex items-center justify-center text-lime font-bold text-sm group-hover:bg-lime/15 transition-colors">
              100
            </div>
            <span className="font-bold text-sm text-txt hidden sm:block">
              Days in Making
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              to="/"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/' ? 'bg-lime/10 text-lime' : 'text-txt-secondary hover:text-txt hover:bg-surface-hover'
                }`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Feed</span>
            </Link>
            {user && (
              <>
                <Link
                  to="/new"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/new' ? 'bg-lime/10 text-lime' : 'text-txt-secondary hover:text-txt hover:bg-surface-hover'
                    }`}
                >
                  <PenSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">New Post</span>
                </Link>
                <Link
                  to="/settings"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/settings' ? 'bg-lime/10 text-lime' : 'text-txt-secondary hover:text-txt hover:bg-surface-hover'
                    }`}
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-xs text-txt-secondary hidden sm:block">{user.name}</span>
                <UserAvatar user={user} size="sm" />
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-txt-muted hover:text-danger hover:bg-danger/10 transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-lime hover:bg-lime/10 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Log in</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-white/[0.06] py-6 text-center text-xs text-txt-muted">
        m100.dev — 100 Days in Making
      </footer>
    </div>
  );
}
