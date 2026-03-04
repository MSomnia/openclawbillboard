"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";
import LangSwitch from "./LangSwitch";

export default function Navbar() {
  const { t } = useT();

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <span className="text-2xl">🦀</span>
          <span>OpenClaw Billboard</span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/discover" className="transition hover:text-gray-900">
            {t("nav.discover")}
          </Link>
          <Link href="/trends" className="transition hover:text-gray-900">
            {t("nav.trends")}
          </Link>
          <a
            href="https://github.com/MSomnia/openclawbillboard"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-gray-900"
          >
            GitHub
          </a>
          <LangSwitch />
        </div>
      </div>
    </nav>
  );
}
