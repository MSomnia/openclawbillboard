import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const DATA_DIR = path.join(process.cwd(), "src/data");

async function main() {
  console.log("[导出] 开始导出 JSON 数据...\n");

  fs.mkdirSync(DATA_DIR, { recursive: true });

  await Promise.all([
    exportProjects(),
    exportSnapshots(),
    exportCommits(),
    exportStats(),
    exportTrending(),
  ]);

  console.log("\n[导出] 全部完成！");
  await prisma.$disconnect();
}

async function exportProjects() {
  const repos = await prisma.repository.findMany({
    orderBy: { stars: "desc" },
  });

  const projects = repos.map((r) => ({
    id: r.id,
    githubId: r.githubId,
    fullName: r.fullName,
    name: r.name,
    owner: r.owner,
    description: r.description,
    url: r.url,
    homepage: r.homepage,
    language: r.language,
    stars: r.stars,
    forks: r.forks,
    openIssues: r.openIssues,
    topics: JSON.parse(r.topics),
    license: r.license,
    isArchived: r.isArchived,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    pushedAt: r.pushedAt?.toISOString() ?? null,
    firstSeenAt: r.firstSeenAt.toISOString(),
    lastFetchedAt: r.lastFetchedAt.toISOString(),
    activityScore: r.activityScore,
  }));

  writeJSON("projects.json", projects);
  console.log(`[导出] projects.json: ${projects.length} 个项目`);
}

async function exportSnapshots() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const snapshots = await prisma.dailySnapshot.findMany({
    where: { date: { gte: thirtyDaysAgo } },
    include: { repository: { select: { fullName: true } } },
    orderBy: [{ repositoryId: "asc" }, { date: "asc" }],
  });

  const data = snapshots.map((s) => ({
    repositoryId: s.repositoryId,
    fullName: s.repository.fullName,
    date: s.date.toISOString(),
    stars: s.stars,
    forks: s.forks,
    openIssues: s.openIssues,
    starsDelta: s.starsDelta,
    forksDelta: s.forksDelta,
    commitsCount: s.commitsCount,
  }));

  writeJSON("snapshots.json", data);
  console.log(`[导出] snapshots.json: ${data.length} 条快照`);
}

async function exportCommits() {
  const commits = await prisma.commitRecord.findMany({
    orderBy: { authorDate: "desc" },
    take: 5000,
    include: { repository: { select: { fullName: true } } },
  });

  const data = commits.map((c) => ({
    repositoryId: c.repositoryId,
    fullName: c.repository.fullName,
    sha: c.sha,
    message: c.message,
    authorName: c.authorName,
    authorDate: c.authorDate.toISOString(),
    url: c.url,
  }));

  writeJSON("commits.json", data);
  console.log(`[导出] commits.json: ${data.length} 条 commit`);
}

async function exportStats() {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [totalProjects, newToday, newThisWeek, activeProjects, starsAgg] =
    await Promise.all([
      prisma.repository.count(),
      prisma.repository.count({
        where: { firstSeenAt: { gte: todayStart } },
      }),
      prisma.repository.count({
        where: { firstSeenAt: { gte: weekAgo } },
      }),
      prisma.repository.count({
        where: { activityScore: { gt: 0 } },
      }),
      prisma.repository.aggregate({ _sum: { stars: true } }),
    ]);

  const stats = {
    totalProjects,
    newProjectsToday: newToday,
    newProjectsThisWeek: newThisWeek,
    activeProjects,
    totalStars: starsAgg._sum.stars ?? 0,
    lastUpdated: now.toISOString(),
  };

  writeJSON("stats.json", stats);
  console.log(`[导出] stats.json: ${totalProjects} 总项目, ${activeProjects} 活跃`);
}

async function exportTrending() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 今日 Star 增长 Top 10
  const todaySnapshots = await prisma.dailySnapshot.findMany({
    where: { date: todayStart },
    orderBy: { starsDelta: "desc" },
    take: 10,
    include: { repository: true },
  });

  const starGrowthTop10 = todaySnapshots.map((s) => formatProject(s.repository));

  // 最活跃 Top 10
  const mostActive = await prisma.repository.findMany({
    orderBy: { activityScore: "desc" },
    take: 10,
  });
  const mostActiveTop10 = mostActive.map(formatProject);

  // 新兴项目：创建 < 30 天 & Star > 10
  const rising = await prisma.repository.findMany({
    where: {
      createdAt: { gte: thirtyDaysAgo },
      stars: { gt: 10 },
    },
    orderBy: { stars: "desc" },
  });
  const newAndRising = rising.map(formatProject);

  writeJSON("trending.json", { starGrowthTop10, mostActiveTop10, newAndRising });
  console.log(
    `[导出] trending.json: star增长${starGrowthTop10.length}, 最活跃${mostActiveTop10.length}, 新兴${newAndRising.length}`
  );
}

function formatProject(r: {
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
  topics: string;
  license: string | null;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  pushedAt: Date | null;
  firstSeenAt: Date;
  lastFetchedAt: Date;
  activityScore: number;
}) {
  return {
    id: r.id,
    githubId: r.githubId,
    fullName: r.fullName,
    name: r.name,
    owner: r.owner,
    description: r.description,
    url: r.url,
    homepage: r.homepage,
    language: r.language,
    stars: r.stars,
    forks: r.forks,
    openIssues: r.openIssues,
    topics: JSON.parse(r.topics),
    license: r.license,
    isArchived: r.isArchived,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    pushedAt: r.pushedAt?.toISOString() ?? null,
    firstSeenAt: r.firstSeenAt.toISOString(),
    lastFetchedAt: r.lastFetchedAt.toISOString(),
    activityScore: r.activityScore,
  };
}

function writeJSON(filename: string, data: unknown) {
  fs.writeFileSync(
    path.join(DATA_DIR, filename),
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}

main().catch((err) => {
  console.error("导出脚本异常:", err);
  process.exit(1);
});
