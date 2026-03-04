"use client";

import { useT } from "@/lib/i18n";

export default function DiscoverHeader() {
  const { t } = useT();

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">{t("discover.title")}</h1>
      <p className="mt-1 text-sm text-gray-500">{t("discover.subtitle")}</p>
    </>
  );
}
