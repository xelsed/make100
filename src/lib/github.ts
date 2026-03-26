interface GitHubRepo {
  url: string;
  name: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  updatedAt: string;
}

export async function fetchRepoMetadata(repoUrl: string): Promise<GitHubRepo | null> {
  try {
    const match = repoUrl.match(/github\.com\/([^/]+\/[^/]+)/);
    if (!match) return null;

    const fullName = match[1].replace(/\.git$/, '');
    const response = await fetch(`https://api.github.com/repos/${fullName}`);
    if (!response.ok) return null;

    const data = await response.json();
    return {
      url: data.html_url,
      name: data.name,
      fullName: data.full_name,
      description: data.description || '',
      language: data.language || 'Unknown',
      stars: data.stargazers_count,
      forks: data.forks_count,
      updatedAt: data.updated_at,
    };
  } catch {
    return null;
  }
}

export function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#3178c6',
    'Python': '#3572A5',
    'Rust': '#dea584',
    'Go': '#00ADD8',
    'C++': '#f34b7d',
    'C': '#555555',
    'Java': '#b07219',
    'Ruby': '#701516',
    'Swift': '#F05138',
    'Kotlin': '#A97BFF',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'Shell': '#89e051',
    'Lua': '#000080',
    'Arduino': '#bd79d1',
  };
  return colors[language] || '#8b949e';
}
