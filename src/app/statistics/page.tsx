import { getProjects, getSnapshots, getCommits } from "@/lib/data";
import StatisticsClient from "./StatisticsClient";

export default function StatisticsPage() {
  const projects = getProjects();
  const snapshots = getSnapshots();
  const commits = getCommits().slice(0, 30);

  return (
    <StatisticsClient
      projects={projects}
      snapshots={snapshots}
      commits={commits}
    />
  );
}
