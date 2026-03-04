"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";
import ProjectCard from "@/components/ProjectCard";
import type { ProjectData, StatsData } from "@/types";

interface HomeClientProps {
  stats: StatsData;
  topByStars: ProjectData[];
  topByActivity: ProjectData[];
  newDiscovered: ProjectData[];
}

export default function HomeClient({
  stats,
  topByStars,
  topByActivity,
  newDiscovered,
}: HomeClientProps) {
  const { lang, t } = useT();
  const locale = lang === "zh" ? "zh-CN" : "en-US";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Hero */}
      <section className="py-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          OpenClaw Billboard
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
          {t("home.subtitle")}
        </p>

        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label={t("home.totalProjects")} value={stats.totalProjects} />
          <StatCard label={t("home.newThisWeek")} value={stats.newProjectsThisWeek} />
          <StatCard label={t("home.activeProjects")} value={stats.activeProjects} />
          <StatCard label={t("home.totalStars")} value={formatNumber(stats.totalStars)} />
        </div>
      </section>

      {/* 热门项目 */}
      <Section title={t("home.hotProjects")} subtitle={t("home.hotProjectsDesc")} linkHref="/discover" linkText={t("home.viewAll")}>
        <div className="grid gap-3 sm:grid-cols-2">
          {topByStars.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </Section>

      {/* 近期活跃 */}
      {topByActivity.length > 0 && (
        <Section title={t("home.recentActive")} subtitle={t("home.recentActiveDesc")} linkHref="/trends" linkText={t("home.viewTrends")}>
          <div className="grid gap-3 sm:grid-cols-2">
            {topByActivity.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </Section>
      )}

      {/* 新发现 */}
      {newDiscovered.length > 0 && (
        <Section title={t("home.newDiscovered")} subtitle={t("home.newDiscoveredDesc")}>
          <div className="grid gap-3 sm:grid-cols-2">
            {newDiscovered.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </Section>
      )}

      <p className="mt-12 text-center text-xs text-gray-400">
        {t("home.lastUpdated")}
        {new Date(stats.lastUpdated).toLocaleString(locale, { timeZone: "Asia/Shanghai" })}
      </p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function Section({
  title,
  subtitle,
  linkHref,
  linkText,
  children,
}: {
  title: string;
  subtitle?: string;
  linkHref?: string;
  linkText?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {linkHref && linkText && (
          <Link href={linkHref} className="text-sm font-medium text-blue-600 hover:text-blue-700">
            {linkText} →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}
