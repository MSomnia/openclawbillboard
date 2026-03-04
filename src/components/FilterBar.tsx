"use client";

import { useT } from "@/lib/i18n";

interface FilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  language: string;
  onLanguageChange: (v: string) => void;
  sortBy: string;
  onSortByChange: (v: string) => void;
  languages: string[];
}

export default function FilterBar({
  search,
  onSearchChange,
  language,
  onLanguageChange,
  sortBy,
  onSortByChange,
  languages,
}: FilterBarProps) {
  const { t } = useT();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        type="text"
        placeholder={t("filter.searchPlaceholder")}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:w-64"
      />
      <select
        value={language}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
      >
        <option value="">{t("filter.allLanguages")}</option>
        {languages.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>
      <select
        value={sortBy}
        onChange={(e) => onSortByChange(e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
      >
        <option value="stars">{t("filter.sortStars")}</option>
        <option value="activity">{t("filter.sortActivity")}</option>
        <option value="updated">{t("filter.sortUpdated")}</option>
        <option value="created">{t("filter.sortCreated")}</option>
        <option value="forks">{t("filter.sortForks")}</option>
      </select>
    </div>
  );
}
