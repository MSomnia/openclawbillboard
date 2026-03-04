"use client";

import Link from "next/link";
import type { ProjectData } from "@/types";
import { useT } from "@/lib/i18n";

function toSlug(fullName: string) {
  return fullName.replace("/", "--");
}

export default function ProjectCard({ project }: { project: ProjectData }) {
  const { t } = useT();

  return (
    <Link
      href={`/projects/${toSlug(project.fullName)}`}
      className="block rounded-lg border border-gray-200 p-4 transition hover:border-gray-300 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-gray-900">
            {project.fullName}
          </h3>
          {project.description && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-500">
              {project.description}
            </p>
          )}
        </div>
        {project.activityScore > 0 && (
          <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
            {project.activityScore.toFixed(0)}{t("project.score")}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
        {project.language && (
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: getLanguageColor(project.language) }} />
            {project.language}
          </span>
        )}
        <span>⭐ {formatNumber(project.stars)}</span>
        <span>🍴 {formatNumber(project.forks)}</span>
        {project.license && <span>📄 {project.license}</span>}
      </div>

      {project.topics.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {project.topics.slice(0, 4).map((topic) => (
            <span key={topic} className="rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-600">
              {topic}
            </span>
          ))}
          {project.topics.length > 4 && (
            <span className="text-xs text-gray-400">+{project.topics.length - 4}</span>
          )}
        </div>
      )}
    </Link>
  );
}

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  Shell: "#89e051",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Zig: "#ec915c",
};

function getLanguageColor(lang: string): string {
  return LANGUAGE_COLORS[lang] || "#6b7280";
}
