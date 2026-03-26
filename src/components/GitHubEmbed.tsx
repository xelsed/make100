import { Star, GitFork, ExternalLink } from 'lucide-react';
import type { GitHubRepo } from '@/types';
import { getLanguageColor } from '@/lib/github';

interface GitHubEmbedProps {
  repo: GitHubRepo;
}

export default function GitHubEmbed({ repo }: GitHubEmbedProps) {
  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block glass rounded-xl p-4 glass-hover group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-brand-400 font-semibold text-sm truncate group-hover:text-brand-300 transition-colors">
              {repo.fullName}
            </span>
            <ExternalLink className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>
          {repo.description && (
            <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-2">
              {repo.description}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {repo.language && (
              <span className="flex items-center gap-1">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: getLanguageColor(repo.language) }}
                />
                {repo.language}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              {repo.stars}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="w-3 h-3" />
              {repo.forks}
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}
