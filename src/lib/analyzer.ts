import { prisma } from "./db";
import { ACTIVITY_WEIGHTS, TREND_WINDOW_DAYS } from "./constants";

interface RepoMetrics {
  recentCommits: number;
  starGrowthRate: number;
  issueActivity: number;
  daysSinceLastPush: number;
  totalStars: number;
}

/**
 * 计算所有仓库的活跃度评分并更新数据库
 */
export async function calculateAllActivityScores(): Promise<void> {
  const repos = await prisma.repository.findMany({
    include: {
      snapshots: {
        where: {
          date: {
            gte: daysAgo(TREND_WINDOW_DAYS),
          },
        },
        orderBy: { date: "desc" },
      },
      commits: {
        where: {
          authorDate: {
            gte: daysAgo(TREND_WINDOW_DAYS),
          },
        },
      },
    },
  });

  if (repos.length === 0) return;

  // 收集所有仓库的原始指标
  const allMetrics: RepoMetrics[] = repos.map((repo) => {
    const recentCommits = repo.commits.length;

    // Star 增长率：近 7 天 star 增量之和
    const starGrowthRate = repo.snapshots.reduce(
      (sum, s) => sum + s.starsDelta,
      0
    );

    // Issue 活动：最新 openIssues 与最早快照的差值（绝对值表示活动量）
    let issueActivity = 0;
    if (repo.snapshots.length >= 2) {
      const latest = repo.snapshots[0].openIssues;
      const earliest = repo.snapshots[repo.snapshots.length - 1].openIssues;
      issueActivity = Math.abs(latest - earliest);
    }

    // 最后 push 距今天数
    const daysSinceLastPush = repo.pushedAt
      ? (Date.now() - new Date(repo.pushedAt).getTime()) / (1000 * 60 * 60 * 24)
      : 365; // 没有 push 记录视为不活跃

    return {
      recentCommits,
      starGrowthRate,
      issueActivity,
      daysSinceLastPush,
      totalStars: repo.stars,
    };
  });

  // 计算各维度的 min 和 max 用于归一化
  const ranges = getMinMaxRanges(allMetrics);

  // 计算每个仓库的评分并更新
  for (let i = 0; i < repos.length; i++) {
    const metrics = allMetrics[i];
    const score = calculateScore(metrics, ranges);

    await prisma.repository.update({
      where: { id: repos[i].id },
      data: { activityScore: Math.round(score * 100) / 100 },
    });
  }
}

function calculateScore(
  metrics: RepoMetrics,
  ranges: Record<keyof RepoMetrics, { min: number; max: number }>
): number {
  const w = ACTIVITY_WEIGHTS;

  const commitScore = normalize(metrics.recentCommits, ranges.recentCommits);
  const starScore = normalize(metrics.starGrowthRate, ranges.starGrowthRate);
  const issueScore = normalize(metrics.issueActivity, ranges.issueActivity);
  // daysSinceLastPush 越小越好，反转归一化
  const pushScore =
    1 - normalize(metrics.daysSinceLastPush, ranges.daysSinceLastPush);
  const totalStarScore = normalize(metrics.totalStars, ranges.totalStars);

  const rawScore =
    w.recentCommits * commitScore +
    w.starGrowthRate * starScore +
    w.issueActivity * issueScore +
    w.daysSinceLastPush * pushScore +
    w.totalStars * totalStarScore;

  return rawScore * 100;
}

function normalize(
  value: number,
  range: { min: number; max: number }
): number {
  if (range.max === range.min) return 0;
  return Math.max(0, Math.min(1, (value - range.min) / (range.max - range.min)));
}

function getMinMaxRanges(
  allMetrics: RepoMetrics[]
): Record<keyof RepoMetrics, { min: number; max: number }> {
  const keys: (keyof RepoMetrics)[] = [
    "recentCommits",
    "starGrowthRate",
    "issueActivity",
    "daysSinceLastPush",
    "totalStars",
  ];

  const ranges = {} as Record<keyof RepoMetrics, { min: number; max: number }>;

  for (const key of keys) {
    const values = allMetrics.map((m) => m[key]);
    ranges[key] = {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }

  return ranges;
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}
