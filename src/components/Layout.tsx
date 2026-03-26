import { Link, useLocation } from 'react-router-dom';
import { Home, PenSquare, Loader2, Settings, LogOut } from 'lucide-react';
import UserAvatar from './UserAvatar';
import { useAuth } from '@/lib/auth';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, loading, logout } = useAuth();

  const navItems = [
    { to: '/', icon: Home, label: 'Feed' },
    { to: '/new', icon: PenSquare, label: 'New Post' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

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
      {/* Top Nav */}
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
            {navItems.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${location.pathname === to
                  ? 'bg-lime/10 text-lime'
                  : 'text-txt-secondary hover:text-txt hover:bg-surface-hover'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user && (
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
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-6 text-center text-xs text-txt-muted">
        m100.dev — 100 Days in Making
      </footer>
    </div>
  );
}
