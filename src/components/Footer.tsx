"use client";

import { useT } from "@/lib/i18n";

export default function Footer() {
  const { t } = useT();

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-500">{t("footer.tagline")}</p>
          <p className="text-sm text-gray-400">{t("footer.update")}</p>
        </div>
      </div>
    </footer>
  );
}
