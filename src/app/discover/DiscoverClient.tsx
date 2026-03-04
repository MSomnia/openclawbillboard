"use client";

import { useState, useMemo } from "react";
import type { ProjectData } from "@/types";
import { useT } from "@/lib/i18n";
import ProjectCard from "@/components/ProjectCard";
import FilterBar from "@/components/FilterBar";

const PAGE_SIZE = 20;

export default function DiscoverClient({ projects }: { projects: ProjectData[] }) {
  const { t } = useT();
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("");
  const [sortBy, setSortBy] = useState("stars");
  const [page, setPage] = useState(1);

  const languages = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.language) set.add(p.language);
    });
    return Array.from(set).sort();
  }, [projects]);

  const filtered = useMemo(() => {
    let result = projects;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (language) {
      result = result.filter((p) => p.language === language);
    }

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "stars":
          return b.stars - a.stars;
        case "activity":
          return b.activityScore - a.activityScore;
        case "updated":
          return b.updatedAt.localeCompare(a.updatedAt);
        case "created":
          return b.createdAt.localeCompare(a.createdAt);
        case "forks":
          return b.forks - a.forks;
        default:
          return 0;
      }
    });

    return result;
  }, [projects, search, language, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearchChange = (v: string) => { setSearch(v); setPage(1); };
  const handleLanguageChange = (v: string) => { setLanguage(v); setPage(1); };
  const handleSortChange = (v: string) => { setSortBy(v); setPage(1); };

  return (
    <div>
      <FilterBar
        search={search}
        onSearchChange={handleSearchChange}
        language={language}
        onLanguageChange={handleLanguageChange}
        sortBy={sortBy}
        onSortByChange={handleSortChange}
        languages={languages}
      />

      <p className="mt-4 text-sm text-gray-500">
        {t("discover.totalCount", { count: filtered.length })}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {paginated.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-12 text-center text-gray-400">{t("discover.noResults")}</p>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-40"
          >
            {t("discover.prevPage")}
          </button>
          <span className="text-sm text-gray-500">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-40"
          >
            {t("discover.nextPage")}
          </button>
        </div>
      )}
    </div>
  );
}
