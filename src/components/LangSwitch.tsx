"use client";

import { useT } from "@/lib/i18n";

export default function LangSwitch() {
  const { lang, setLang } = useT();

  return (
    <button
      onClick={() => setLang(lang === "zh" ? "en" : "zh")}
      className="rounded border border-gray-300 px-2 py-0.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
    >
      {lang === "zh" ? "EN" : "中文"}
    </button>
  );
}
