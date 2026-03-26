interface AnyUser {
  id?: string;
  name?: string;
  avatar_url?: string | null;
  avatarUrl?: string | null;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function hashColor(str: string): string {
  const colors = [
    'from-blue-500 to-cyan-400',
    'from-purple-500 to-pink-400',
    'from-orange-500 to-yellow-400',
    'from-green-500 to-emerald-400',
    'from-red-500 to-rose-400',
    'from-indigo-500 to-violet-400',
    'from-teal-500 to-cyan-400',
    'from-fuchsia-500 to-purple-400',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

interface UserAvatarProps {
  user: AnyUser;
  size?: 'sm' | 'md' | 'lg';
  showOnline?: boolean;
}

export default function UserAvatar({ user, size = 'md', showOnline = false }: UserAvatarProps) {
  const name = user.name || 'U';
  const avatarUrl = user.avatar_url || user.avatarUrl;
  const id = user.id || name;

  const sizeClasses = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-12 h-12 text-sm',
  };

  return (
    <div className="relative inline-flex flex-shrink-0">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-white/10`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${hashColor(id)} flex items-center justify-center font-semibold text-white ring-2 ring-white/10`}
        >
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}
