import { notFound } from "next/navigation";
import {
  getProjects,
  getProjectBySlug,
  getSnapshotsByRepo,
  getCommitsByRepo,
  toSlug,
} from "@/lib/data";
import ProjectClient from "./ProjectClient";

export function generateStaticParams() {
  const projects = getProjects();
  return projects.map((p) => ({ slug: toSlug(p.fullName) }));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  const snapshots = getSnapshotsByRepo(project.fullName);
  const commits = getCommitsByRepo(project.fullName, 20);

  return <ProjectClient project={project} snapshots={snapshots} commits={commits} />;
}
