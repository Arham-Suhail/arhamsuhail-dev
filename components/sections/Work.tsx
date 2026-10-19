import WorkClient from "./WorkClient";
import { projects } from "@/lib/projects";

export default function Work() {
  return <WorkClient projects={projects} />;
}
