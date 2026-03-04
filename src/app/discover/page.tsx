import { getProjects } from "@/lib/data";
import DiscoverHeader from "./DiscoverHeader";
import DiscoverClient from "./DiscoverClient";

export default function DiscoverPage() {
  const projects = getProjects();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <DiscoverHeader />
      <div className="mt-6">
        <DiscoverClient projects={projects} />
      </div>
    </div>
  );
}
