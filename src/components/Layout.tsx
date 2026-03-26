import { Link, useLocation } from 'react-router-dom';
import { Home, PenSquare, Users } from 'lucide-react';
import UserAvatar from './UserAvatar';
import { getCurrentUser, getUsers } from '@/lib/store';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const currentUser = getCurrentUser();
  const users = getUsers();
  const onlineUsers = users.filter(u => u.isOnline);

  const navItems = [
    { to: '/', icon: Home, label: 'Feed' },
    { to: '/new', icon: PenSquare, label: 'New Post' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
              100
            </div>
            <span className="font-bold text-sm text-gray-100 hidden sm:block">
              Days in Making
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === to
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
            {/* Online indicators */}
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-gray-500" />
              <div className="flex -space-x-1.5">
                {onlineUsers.slice(0, 4).map(u => (
                  <UserAvatar key={u.id} user={u} size="sm" showOnline />
                ))}
              </div>
            </div>

            <div className="w-px h-6 bg-white/10" />
            <UserAvatar user={currentUser} size="sm" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-4 text-center text-xs text-gray-600">
        100 Days in Making
      </footer>
    </div>
  );
}
