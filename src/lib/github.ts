import {
  GitHubSearchResponse,
  GitHubRepo,
  GitHubCommit,
  RateLimitInfo,
} from "@/types";
import {
  GITHUB_API_BASE,
  RATE_LIMIT_THRESHOLD,
  RATE_LIMIT_DELAY_MS,
} from "./constants";

let rateLimitInfo: RateLimitInfo = { remaining: 5000, reset: 0 };

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function updateRateLimit(response: Response) {
  const remaining = response.headers.get("X-RateLimit-Remaining");
  const reset = response.headers.get("X-RateLimit-Reset");
  if (remaining !== null) rateLimitInfo.remaining = parseInt(remaining, 10);
  if (reset !== null) rateLimitInfo.reset = parseInt(reset, 10);
}

async function handleRateLimit() {
  if (rateLimitInfo.remaining <= 0) {
    const waitMs = (rateLimitInfo.reset * 1000 - Date.now()) + 1000;
    if (waitMs > 0) {
      console.log(`[Rate Limit] 已耗尽，等待 ${Math.ceil(waitMs / 1000)}s...`);
      await sleep(waitMs);
    }
  } else if (rateLimitInfo.remaining < RATE_LIMIT_THRESHOLD) {
    console.log(
      `[Rate Limit] 剩余 ${rateLimitInfo.remaining}，降速中...`
    );
    await sleep(RATE_LIMIT_DELAY_MS);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function githubFetch<T>(url: string): Promise<T> {
  await handleRateLimit();

  const response = await fetch(url, { headers: getHeaders() });
  updateRateLimit(response);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText} - ${body}`
    );
  }

  return response.json() as Promise<T>;
}

/**
 * 搜索包含关键词的仓库，处理分页并合并去重
 */
export async function searchRepositories(
  keywords: string[]
): Promise<GitHubRepo[]> {
  const repoMap = new Map<number, GitHubRepo>();

  for (const keyword of keywords) {
    let page = 1;
    const perPage = 100;

    while (true) {
      const url = `${GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(keyword)}&sort=updated&per_page=${perPage}&page=${page}`;
      const data = await githubFetch<GitHubSearchResponse>(url);

      for (const repo of data.items) {
        if (!repoMap.has(repo.id)) {
          repoMap.set(repo.id, repo);
        }
      }

      // GitHub 搜索 API 最多返回 1000 条结果
      if (data.items.length < perPage || page * perPage >= 1000) {
        break;
      }
      page++;
    }
  }

  return Array.from(repoMap.values());
}

/**
 * 获取单个仓库详情
 */
export async function getRepoDetails(fullName: string): Promise<GitHubRepo> {
  const url = `${GITHUB_API_BASE}/repos/${fullName}`;
  return githubFetch<GitHubRepo>(url);
}

/**
 * 获取仓库最近的 commit 列表
 */
export async function getRecentCommits(
  fullName: string,
  since: Date
): Promise<GitHubCommit[]> {
  const url = `${GITHUB_API_BASE}/repos/${fullName}/commits?since=${since.toISOString()}&per_page=100`;
  try {
    return await githubFetch<GitHubCommit[]>(url);
  } catch (error) {
    // 空仓库或无 commit 时返回空数组
    if (
      error instanceof Error &&
      (error.message.includes("409") || error.message.includes("404"))
    ) {
      return [];
    }
    throw error;
  }
}

/**
 * 获取当前速率限制状态
 */
export function getRateLimitInfo(): RateLimitInfo {
  return { ...rateLimitInfo };
}
