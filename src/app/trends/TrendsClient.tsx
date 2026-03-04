"use client";

import { useT } from "@/lib/i18n";
import ProjectCard from "@/components/ProjectCard";
import type { TrendingData } from "@/types";

export default function TrendsClient({ trending }: { trending: TrendingData }) {
  const { t } = useT();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">{t("trends.title")}</h1>
      <p className="mt-1 text-sm text-gray-500">{t("trends.subtitle")}</p>

      {trending.starGrowthTop10.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            ⭐ {t("trends.starGrowth")}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {trending.starGrowthTop10.map((p, i) => (
              <div key={p.id} className="relative">
                <span className="absolute -left-1 -top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <ProjectCard project={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {trending.mostActiveTop10.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            🔥 {t("trends.mostActive")}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {trending.mostActiveTop10.map((p, i) => (
              <div key={p.id} className="relative">
                <span className="absolute -left-1 -top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-orange-400 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <ProjectCard project={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {trending.newAndRising.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            🚀 {t("trends.rising")}
          </h2>
          <p className="mb-3 text-sm text-gray-500">{t("trends.risingDesc")}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {trending.newAndRising.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      )}

      {trending.starGrowthTop10.length === 0 &&
        trending.mostActiveTop10.length === 0 &&
        trending.newAndRising.length === 0 && (
          <p className="mt-12 text-center text-gray-400">{t("trends.noData")}</p>
        )}
    </div>
  );
}
