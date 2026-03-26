import { Link, useLocation } from 'react-router-dom';
import { Home, PenSquare, Loader2, Settings } from 'lucide-react';
import UserAvatar from './UserAvatar';
import { useAuth } from '@/lib/auth';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, loading } = useAuth();

  const navItems = [
    { to: '/', icon: Home, label: 'Feed' },
    { to: '/new', icon: PenSquare, label: 'New Post' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-coral to-amber flex items-center justify-center text-white font-extrabold text-lg mb-4 mx-auto">
            100
          </div>
          <Loader2 className="w-5 h-5 text-gray-500 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-coral to-amber flex items-center justify-center text-white font-bold text-sm">
              100
            </div>
            <span className="font-bold text-sm text-[#e8e6e3] hidden sm:block">
              Days in Making
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${location.pathname === to
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
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
                <span className="text-xs text-[#7a7a85] hidden sm:block">{user.name}</span>
                <UserAvatar user={user} size="sm" />
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
      <footer className="border-t border-white/5 py-4 text-center text-xs text-[#7a7a85]">
        m100.dev — 100 Days in Making
      </footer>
    </div>
  );
}
