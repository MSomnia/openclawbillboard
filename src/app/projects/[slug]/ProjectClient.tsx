"use client";

import { useT } from "@/lib/i18n";
import TrendChart from "@/components/TrendChart";
import type { ProjectData, SnapshotData, CommitData } from "@/types";

interface ProjectClientProps {
  project: ProjectData;
  snapshots: SnapshotData[];
  commits: CommitData[];
}

export default function ProjectClient({ project, snapshots, commits }: ProjectClientProps) {
  const { lang, t } = useT();
  const locale = lang === "zh" ? "zh-CN" : "en-US";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.fullName}</h1>
          {project.description && (
            <p className="mt-2 text-gray-500">{project.description}</p>
          )}
        </div>
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          {t("project.viewOnGithub")}
        </a>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <MetricCard label="Stars" value={project.stars} />
        <MetricCard label="Forks" value={project.forks} />
        <MetricCard label="Open Issues" value={project.openIssues} />
        <MetricCard label={t("project.activity")} value={project.activityScore.toFixed(0)} />
        <MetricCard label={t("project.language")} value={project.language || "-"} />
      </div>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
        {project.license && <span>📄 {project.license}</span>}
        {project.homepage && (
          <a
            href={project.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            🌐 {t("project.homepage")}
          </a>
        )}
        <span>{t("project.createdAt")} {new Date(project.createdAt).toLocaleDateString(locale)}</span>
        {project.pushedAt && (
          <span>{t("project.lastPush")} {new Date(project.pushedAt).toLocaleDateString(locale)}</span>
        )}
      </div>

      {project.topics.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.topics.map((topic) => (
            <span key={topic} className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">
              {topic}
            </span>
          ))}
        </div>
      )}

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-bold text-gray-900">{t("project.trend30d")}</h2>
        <TrendChart snapshots={snapshots} />
      </section>

      {commits.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            {t("project.recentCommits")} ({commits.length})
          </h2>
          <div className="space-y-3">
            {commits.map((c) => (
              <div key={c.sha} className="flex gap-3 rounded-lg border border-gray-100 p-3">
                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-green-400" />
                <div className="min-w-0 flex-1">
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-sm font-medium text-gray-900 hover:text-blue-600"
                  >
                    {c.message.split("\n")[0]}
                  </a>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {c.authorName} · {new Date(c.authorDate).toLocaleDateString(locale)} ·{" "}
                    <span className="font-mono">{c.sha.slice(0, 7)}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-center">
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
