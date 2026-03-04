import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config(); // fallback to .env
import { PrismaClient } from "@prisma/client";
import { searchRepositories, getRecentCommits } from "../src/lib/github";
import { SEARCH_KEYWORDS, COMMITS_LOOKBACK_HOURS } from "../src/lib/constants";
import type { GitHubRepo } from "../src/types";

const prisma = new PrismaClient();

async function main() {
  const startTime = Date.now();
  console.log("========================================");
  console.log(`[OpenClaw Hub] 每日采集开始: ${new Date().toISOString()}`);
  console.log("========================================\n");

  // 1. 创建 FetchLog 记录
  const fetchLog = await prisma.fetchLog.create({ data: {} });

  const errors: string[] = [];
  let reposFound = 0;
  let reposUpdated = 0;
  let newRepos = 0;

  try {
    // 2. 搜索所有相关仓库
    console.log(`[搜索] 关键词: ${SEARCH_KEYWORDS.join(", ")}`);
    const repos = await searchRepositories(SEARCH_KEYWORDS);
    reposFound = repos.length;
    console.log(`[搜索] 找到 ${reposFound} 个仓库\n`);

    // 3. 处理每个仓库
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const commitsSince = new Date(
      Date.now() - COMMITS_LOOKBACK_HOURS * 60 * 60 * 1000
    );

    for (const repo of repos) {
      try {
        const result = await processRepo(repo, today, commitsSince);
        if (result === "new") newRepos++;
        if (result === "updated") reposUpdated++;
      } catch (err) {
        const msg = `处理 ${repo.full_name} 失败: ${err instanceof Error ? err.message : String(err)}`;
        console.error(`[错误] ${msg}`);
        errors.push(msg);
      }
    }

    // 4. 计算活跃度评分
    console.log("\n[评分] 计算活跃度评分...");
    // 直接内联评分逻辑以避免 tsconfig paths 问题
    await calculateScores();
    console.log("[评分] 完成");

    // 5. 更新 FetchLog
    await prisma.fetchLog.update({
      where: { id: fetchLog.id },
      data: {
        completedAt: new Date(),
        reposFound,
        reposUpdated,
        newRepos,
        errors: JSON.stringify(errors),
        status: "completed",
      },
    });
  } catch (err) {
    const msg = `采集失败: ${err instanceof Error ? err.message : String(err)}`;
    console.error(`\n[致命错误] ${msg}`);
    errors.push(msg);

    await prisma.fetchLog.update({
      where: { id: fetchLog.id },
      data: {
        completedAt: new Date(),
        reposFound,
        reposUpdated,
        newRepos,
        errors: JSON.stringify(errors),
        status: "failed",
      },
    });
  }

  // 6. 输出采集报告
  const duration = Date.now() - startTime;
  console.log("\n========================================");
  console.log("[采集报告]");
  console.log(`  找到仓库: ${reposFound}`);
  console.log(`  更新仓库: ${reposUpdated}`);
  console.log(`  新增仓库: ${newRepos}`);
  console.log(`  错误数量: ${errors.length}`);
  console.log(`  耗时: ${(duration / 1000).toFixed(1)}s`);
  console.log("========================================");

  await prisma.$disconnect();
}

async function processRepo(
  repo: GitHubRepo,
  today: Date,
  commitsSince: Date
): Promise<"new" | "updated"> {
  const existing = await prisma.repository.findUnique({
    where: { githubId: repo.id },
  });

  const repoData = {
    githubId: repo.id,
    fullName: repo.full_name,
    name: repo.name,
    owner: repo.owner.login,
    description: repo.description,
    url: repo.html_url,
    homepage: repo.homepage,
    language: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    openIssues: repo.open_issues_count,
    topics: JSON.stringify(repo.topics || []),
    license: repo.license?.spdx_id || null,
    isArchived: repo.archived,
    createdAt: new Date(repo.created_at),
    updatedAt: new Date(repo.updated_at),
    pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
    lastFetchedAt: new Date(),
  };

  let dbRepo;
  let result: "new" | "updated";

  if (existing) {
    dbRepo = await prisma.repository.update({
      where: { id: existing.id },
      data: repoData,
    });
    result = "updated";
    console.log(`  [更新] ${repo.full_name} ⭐${repo.stargazers_count}`);
  } else {
    dbRepo = await prisma.repository.create({
      data: repoData,
    });
    result = "new";
    console.log(`  [新增] ${repo.full_name} ⭐${repo.stargazers_count}`);
  }

  // 创建 DailySnapshot
  const previousSnapshot = await prisma.dailySnapshot.findFirst({
    where: { repositoryId: dbRepo.id },
    orderBy: { date: "desc" },
  });

  // 获取最近 commit
  let commitsCount = 0;
  try {
    const commits = await getRecentCommits(repo.full_name, commitsSince);
    commitsCount = commits.length;

    // 存储 commit 记录
    for (const commit of commits) {
      await prisma.commitRecord.upsert({
        where: {
          repositoryId_sha: {
            repositoryId: dbRepo.id,
            sha: commit.sha,
          },
        },
        update: {},
        create: {
          repositoryId: dbRepo.id,
          sha: commit.sha,
          message: commit.commit.message.substring(0, 500),
          authorName: commit.commit.author.name,
          authorDate: new Date(commit.commit.author.date),
          url: commit.html_url,
        },
      });
    }
  } catch (err) {
    console.warn(
      `  [警告] 获取 ${repo.full_name} commits 失败: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  // 创建今日快照
  await prisma.dailySnapshot.upsert({
    where: {
      repositoryId_date: {
        repositoryId: dbRepo.id,
        date: today,
      },
    },
    update: {
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      openIssues: repo.open_issues_count,
      starsDelta: previousSnapshot
        ? repo.stargazers_count - previousSnapshot.stars
        : 0,
      forksDelta: previousSnapshot
        ? repo.forks_count - previousSnapshot.forks
        : 0,
      commitsCount,
    },
    create: {
      repositoryId: dbRepo.id,
      date: today,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      openIssues: repo.open_issues_count,
      starsDelta: previousSnapshot
        ? repo.stargazers_count - previousSnapshot.stars
        : 0,
      forksDelta: previousSnapshot
        ? repo.forks_count - previousSnapshot.forks
        : 0,
      commitsCount,
    },
  });

  return result;
}

/**
 * 计算所有仓库活跃度评分（内联版本，避免 path alias 问题）
 */
async function calculateScores() {
  const WEIGHTS = {
    recentCommits: 0.3,
    starGrowthRate: 0.25,
    issueActivity: 0.15,
    daysSinceLastPush: 0.2,
    totalStars: 0.1,
  };

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const repos = await prisma.repository.findMany({
    include: {
      snapshots: {
        where: { date: { gte: sevenDaysAgo } },
        orderBy: { date: "desc" },
      },
      commits: {
        where: { authorDate: { gte: sevenDaysAgo } },
      },
    },
  });

  if (repos.length === 0) return;

  type Metrics = {
    recentCommits: number;
    starGrowthRate: number;
    issueActivity: number;
    daysSinceLastPush: number;
    totalStars: number;
  };

  const allMetrics: Metrics[] = repos.map((repo) => {
    const starGrowthRate = repo.snapshots.reduce(
      (sum, s) => sum + s.starsDelta,
      0
    );
    let issueActivity = 0;
    if (repo.snapshots.length >= 2) {
      issueActivity = Math.abs(
        repo.snapshots[0].openIssues -
          repo.snapshots[repo.snapshots.length - 1].openIssues
      );
    }
    const daysSinceLastPush = repo.pushedAt
      ? (Date.now() - new Date(repo.pushedAt).getTime()) /
        (1000 * 60 * 60 * 24)
      : 365;

    return {
      recentCommits: repo.commits.length,
      starGrowthRate,
      issueActivity,
      daysSinceLastPush,
      totalStars: repo.stars,
    };
  });

  // min-max ranges
  const keys: (keyof Metrics)[] = [
    "recentCommits",
    "starGrowthRate",
    "issueActivity",
    "daysSinceLastPush",
    "totalStars",
  ];
  const ranges: Record<string, { min: number; max: number }> = {};
  for (const key of keys) {
    const values = allMetrics.map((m) => m[key]);
    ranges[key] = { min: Math.min(...values), max: Math.max(...values) };
  }

  const norm = (val: number, key: string) => {
    const r = ranges[key];
    if (r.max === r.min) return 0;
    return Math.max(0, Math.min(1, (val - r.min) / (r.max - r.min)));
  };

  for (let i = 0; i < repos.length; i++) {
    const m = allMetrics[i];
    const score =
      (WEIGHTS.recentCommits * norm(m.recentCommits, "recentCommits") +
        WEIGHTS.starGrowthRate * norm(m.starGrowthRate, "starGrowthRate") +
        WEIGHTS.issueActivity * norm(m.issueActivity, "issueActivity") +
        WEIGHTS.daysSinceLastPush *
          (1 - norm(m.daysSinceLastPush, "daysSinceLastPush")) +
        WEIGHTS.totalStars * norm(m.totalStars, "totalStars")) *
      100;

    await prisma.repository.update({
      where: { id: repos[i].id },
      data: { activityScore: Math.round(score * 100) / 100 },
    });
  }
}

main().catch((err) => {
  console.error("采集脚本异常退出:", err);
  process.exit(1);
});
