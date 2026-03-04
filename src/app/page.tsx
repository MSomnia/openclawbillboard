import { getProjects, getStats, getTrending } from "@/lib/data";
import HomeClient from "./HomeClient";

export default function Home() {
  const stats = getStats();
  const projects = getProjects();
  const trending = getTrending();

  const topByStars = projects.slice(0, 10);
  const topByActivity = trending.mostActiveTop10;

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const newDiscovered = projects
    .filter((p) => p.firstSeenAt >= weekAgo)
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 10);

  return (
    <HomeClient
      stats={stats}
      topByStars={topByStars}
      topByActivity={topByActivity}
      newDiscovered={newDiscovered}
    />
  );
}
