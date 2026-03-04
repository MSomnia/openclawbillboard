"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { SnapshotData } from "@/types";
import { useT } from "@/lib/i18n";

export default function TrendChart({ snapshots }: { snapshots: SnapshotData[] }) {
  const { lang, t } = useT();

  if (snapshots.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-400">{t("chart.noData")}</p>;
  }

  const locale = lang === "zh" ? "zh-CN" : "en-US";
  const data = snapshots.map((s) => ({
    date: new Date(s.date).toLocaleDateString(locale, { month: "short", day: "numeric" }),
    Stars: s.stars,
    Forks: s.forks,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="Stars" stroke="#eab308" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Forks" stroke="#3b82f6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
