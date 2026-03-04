import fs from "fs";
import path from "path";
import type {
  ProjectData,
  SnapshotData,
  StatsData,
  TrendingData,
} from "@/types";

const DATA_DIR = path.join(process.cwd(), "src/data");

function readJSON<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export function getProjects(): ProjectData[] {
  return readJSON<ProjectData[]>("projects.json");
}

export function getProjectBySlug(slug: string): ProjectData | undefined {
  // slug 格式: owner--repo (fullName 中 "/" 替换为 "--")
  const fullName = slug.replace("--", "/");
  const projects = getProjects();
  return projects.find((p) => p.fullName === fullName);
}

export function getSnapshots(): SnapshotData[] {
  return readJSON<SnapshotData[]>("snapshots.json");
}

export function getSnapshotsByRepo(fullName: string): SnapshotData[] {
  const snapshots = getSnapshots();
  return snapshots.filter((s) => s.fullName === fullName);
}

export function getStats(): StatsData {
  return readJSON<StatsData>("stats.json");
}

export function getTrending(): TrendingData {
  return readJSON<TrendingData>("trending.json");
}

/** 将 fullName (owner/repo) 转为 URL slug (owner--repo) */
export function toSlug(fullName: string): string {
  return fullName.replace("/", "--");
}

/** 将 URL slug (owner--repo) 还原为 fullName (owner/repo) */
export function fromSlug(slug: string): string {
  return slug.replace("--", "/");
}
