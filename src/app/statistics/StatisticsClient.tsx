"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";
import { useT } from "@/lib/i18n";
import type { ProjectData, SnapshotData, CommitData } from "@/types";

function toSlug(fullName: string): string {
  return fullName.replace("/", "--");
}

const PIE_COLORS = [
  "#3b82f6", "#ef4444", "#eab308", "#22c55e", "#a855f7",
  "#f97316", "#06b6d4", "#ec4899", "#14b8a6", "#8b5cf6",
  "#6b7280",
];

export default function StatisticsClient({
  projects,
  snapshots,
  commits,
}: {
  projects: ProjectData[];
  snapshots: SnapshotData[];
  commits: CommitData[];
}) {
  const { t, lang } = useT();
  const locale = lang === "zh" ? "zh-CN" : "en-US";

  // --- Language distribution ---
  const langData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of projects) {
      const l = p.language || (lang === "zh" ? "未知" : "Unknown");
      counts[l] = (counts[l] || 0) + 1;
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const top10 = sorted.slice(0, 10);
    const otherCount = sorted.slice(10).reduce((sum, [, c]) => sum + c, 0);
    const result = top10.map(([name, value]) => ({ name, value }));
    if (otherCount > 0) {
      result.push({ name: t("stats.other"), value: otherCount });
    }
    return result;
  }, [projects, lang, t]);

  // --- Ecosystem trend (aggregate snapshots by date) ---
  const trendData = useMemo(() => {
    const byDate: Record<string, { stars: number; commits: number }> = {};
    for (const s of snapshots) {
      const dateKey = s.date.slice(0, 10);
      if (!byDate[dateKey]) {
        byDate[dateKey] = { stars: 0, commits: 0 };
      }
      byDate[dateKey].stars += s.stars;
      byDate[dateKey].commits += s.commitsCount;
    }
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({
        date: new Date(date).toLocaleDateString(locale, {
          month: "short",
          day: "numeric",
        }),
        [t("stats.totalStars")]: d.stars,
        [t("stats.totalCommits")]: d.commits,
      }));
  }, [snapshots, locale, t]);

  // --- Relative time helper ---
  function relativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return lang === "zh" ? `${mins} 分钟前` : `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return lang === "zh" ? `${hours} 小时前` : `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return lang === "zh" ? `${days} 天前` : `${days}d ago`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">{t("stats.page.title")}</h1>
      <p className="mt-1 text-sm text-gray-500">{t("stats.page.subtitle")}</p>

      {/* Language Distribution */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          📊 {t("stats.langDist")}
        </h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={langData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={110}
                paddingAngle={2}
                dataKey="value"
                label={(props: PieLabelRenderProps) =>
                  `${props.name ?? ""} ${(((props.percent as number) ?? 0) * 100).toFixed(0)}%`
                }
              >
                {langData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: unknown) =>
                  `${value} ${t("stats.projects")}`
                }
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Ecosystem Trends */}
      {trendData.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            📈 {t("stats.ecoTrend")}
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  stroke="#eab308"
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  stroke="#3b82f6"
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey={t("stats.totalStars")}
                  stroke="#eab308"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey={t("stats.totalCommits")}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Recent Commits */}
      <section className="mt-10">
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          🕐 {t("stats.recentCommits")}
        </h2>
        {commits.length === 0 ? (
          <p className="text-center text-gray-400">{t("stats.noCommits")}</p>
        ) : (
          <div className="space-y-3">
            {commits.map((c) => (
              <div
                key={c.sha}
                className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3"
              >
                <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {c.message}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    <Link
                      href={`/projects/${toSlug(c.fullName)}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {c.fullName}
                    </Link>
                    {" · "}
                    {c.authorName}
                    {" · "}
                    {relativeTime(c.authorDate)}
                  </p>
                </div>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 rounded bg-gray-200 px-2 py-0.5 text-xs font-mono text-gray-600 hover:bg-gray-300"
                >
                  {c.sha.slice(0, 7)}
                </a>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
