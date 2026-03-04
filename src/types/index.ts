// GitHub API 响应类型

export interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepo[];
}

export interface GitHubRepo {
  id: number;
  full_name: string;
  name: string;
  owner: {
    login: string;
  };
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  topics: string[];
  license: {
    spdx_id: string;
  } | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string | null;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  html_url: string;
}

export interface RateLimitInfo {
  remaining: number;
  reset: number; // Unix timestamp
}

export interface FetchReport {
  reposFound: number;
  reposUpdated: number;
  newRepos: number;
  errors: string[];
  duration: number; // 毫秒
}

// JSON 导出数据类型（供 SSG 页面使用）

export interface ProjectData {
  id: number;
  githubId: number;
  fullName: string;
  name: string;
  owner: string;
  description: string | null;
  url: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  topics: string[];
  license: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  pushedAt: string | null;
  firstSeenAt: string;
  lastFetchedAt: string;
  activityScore: number;
}

export interface SnapshotData {
  repositoryId: number;
  fullName: string;
  date: string;
  stars: number;
  forks: number;
  openIssues: number;
  starsDelta: number;
  forksDelta: number;
  commitsCount: number;
}

export interface StatsData {
  totalProjects: number;
  newProjectsToday: number;
  newProjectsThisWeek: number;
  activeProjects: number; // activityScore > 0
  totalStars: number;
  lastUpdated: string;
}

export interface TrendingData {
  starGrowthTop10: ProjectData[];
  mostActiveTop10: ProjectData[];
  newAndRising: ProjectData[]; // 创建 < 30 天 & star > 10
}

export interface CommitData {
  repositoryId: number;
  fullName: string;
  sha: string;
  message: string;
  authorName: string;
  authorDate: string;
  url: string;
}
