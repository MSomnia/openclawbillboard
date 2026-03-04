"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Lang = "zh" | "en";

const translations = {
  // Navbar
  "nav.discover": { zh: "发现", en: "Discover" },
  "nav.trends": { zh: "趋势", en: "Trends" },

  // Footer
  "footer.tagline": {
    zh: "OpenClaw Billboard — 自动聚合 OpenClaw 生态开源项目",
    en: "OpenClaw Billboard — Aggregating OpenClaw ecosystem projects",
  },
  "footer.update": {
    zh: "数据每日自动更新 · 由 GitHub Actions 驱动",
    en: "Data updated daily · Powered by GitHub Actions",
  },

  // Home - Hero
  "home.subtitle": {
    zh: "一站式追踪 OpenClaw 生态的所有开源项目，每日自动更新",
    en: "Track all OpenClaw ecosystem projects in one place, updated daily",
  },
  "home.totalProjects": { zh: "总项目数", en: "Total Projects" },
  "home.newThisWeek": { zh: "本周新增", en: "New This Week" },
  "home.activeProjects": { zh: "活跃项目", en: "Active Projects" },
  "home.totalStars": { zh: "总 Star", en: "Total Stars" },

  // Home - Sections
  "home.hotProjects": { zh: "热门项目", en: "Popular Projects" },
  "home.hotProjectsDesc": { zh: "按 Star 数排行", en: "Ranked by Stars" },
  "home.viewAll": { zh: "查看全部", en: "View All" },
  "home.recentActive": { zh: "近期活跃", en: "Recently Active" },
  "home.recentActiveDesc": { zh: "按活跃度评分排行", en: "Ranked by Activity Score" },
  "home.viewTrends": { zh: "查看趋势", en: "View Trends" },
  "home.newDiscovered": { zh: "新发现", en: "New Discoveries" },
  "home.newDiscoveredDesc": { zh: "最近 7 天新入库的项目", en: "Projects added in the last 7 days" },
  "home.lastUpdated": { zh: "数据最后更新：", en: "Last updated: " },

  // Discover
  "discover.title": { zh: "发现项目", en: "Discover Projects" },
  "discover.subtitle": {
    zh: "浏览、搜索和筛选所有 OpenClaw 生态项目",
    en: "Browse, search, and filter all OpenClaw ecosystem projects",
  },
  "discover.totalCount": { zh: "共 {count} 个项目", en: "{count} projects found" },
  "discover.noResults": { zh: "没有找到匹配的项目", en: "No matching projects found" },
  "discover.prevPage": { zh: "上一页", en: "Previous" },
  "discover.nextPage": { zh: "下一页", en: "Next" },

  // Filter
  "filter.searchPlaceholder": { zh: "搜索项目名称或描述...", en: "Search by name or description..." },
  "filter.allLanguages": { zh: "所有语言", en: "All Languages" },
  "filter.sortStars": { zh: "按 Star 排序", en: "Sort by Stars" },
  "filter.sortActivity": { zh: "按活跃度排序", en: "Sort by Activity" },
  "filter.sortUpdated": { zh: "按更新时间排序", en: "Sort by Updated" },
  "filter.sortCreated": { zh: "按创建时间排序", en: "Sort by Created" },
  "filter.sortForks": { zh: "按 Fork 排序", en: "Sort by Forks" },

  // Trends
  "trends.title": { zh: "趋势", en: "Trends" },
  "trends.subtitle": {
    zh: "OpenClaw 生态的增长排行与新兴项目",
    en: "Growth rankings and emerging projects in the OpenClaw ecosystem",
  },
  "trends.starGrowth": { zh: "今日 Star 增长最快", en: "Fastest Star Growth Today" },
  "trends.mostActive": { zh: "本周最活跃", en: "Most Active This Week" },
  "trends.rising": { zh: "新兴项目", en: "Rising Projects" },
  "trends.risingDesc": {
    zh: "创建不到 30 天且 Star 超过 10 的项目",
    en: "Projects created within 30 days with 10+ stars",
  },
  "trends.noData": { zh: "暂无趋势数据，等待更多采集", en: "No trend data yet, awaiting more collection" },

  // Project Detail
  "project.viewOnGithub": { zh: "在 GitHub 上查看", en: "View on GitHub" },
  "project.activity": { zh: "活跃度", en: "Activity" },
  "project.language": { zh: "语言", en: "Language" },
  "project.homepage": { zh: "项目主页", en: "Homepage" },
  "project.createdAt": { zh: "创建于", en: "Created" },
  "project.lastPush": { zh: "最后推送", en: "Last push" },
  "project.trend30d": { zh: "趋势（最近 30 天）", en: "Trends (Last 30 days)" },
  "project.recentCommits": { zh: "最近 Commits", en: "Recent Commits" },
  "project.score": { zh: "分", en: "pts" },

  // TrendChart
  "chart.noData": { zh: "暂无趋势数据", en: "No trend data available" },
} as const;

type TranslationKey = keyof typeof translations;

const LangContext = createContext<{
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}>({
  lang: "zh",
  setLang: () => {},
  t: (key) => translations[key]?.zh ?? key,
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("zh");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved === "zh" || saved === "en") {
      setLangState(saved);
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>): string => {
      let text: string = translations[key]?.[lang] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          text = text.replace(`{${k}}`, String(v));
        }
      }
      return text;
    },
    [lang]
  );

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useT() {
  return useContext(LangContext);
}
