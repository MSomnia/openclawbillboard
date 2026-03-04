// 搜索关键词
export const SEARCH_KEYWORDS = ["openclaw", "open-claw", "open_claw"];

// GitHub API 配置
export const GITHUB_API_BASE = "https://api.github.com";
export const RATE_LIMIT_THRESHOLD = 100; // 剩余请求数低于此值时降速
export const RATE_LIMIT_DELAY_MS = 2000; // 降速时每次请求间隔（毫秒）

// 活跃度评分权重
export const ACTIVITY_WEIGHTS = {
  recentCommits: 0.3,
  starGrowthRate: 0.25,
  issueActivity: 0.15,
  daysSinceLastPush: 0.2,
  totalStars: 0.1,
};

// 采集配置
export const COMMITS_LOOKBACK_HOURS = 24;
export const TREND_WINDOW_DAYS = 7;
