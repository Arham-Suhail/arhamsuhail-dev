import fs from "fs";
import path from "path";
import WorkClient from "./WorkClient";
import { projects, demos, type Project } from "../../data/projects";

export default function Work() {
  // Validate images on the server side to ensure robustness
  const validatedProjects: Project[] = projects.map(project => {
    let validImage = project.image;
    
    if (validImage) {
      // Use process.cwd() to construct absolute path to the public directory
      const imagePath = path.join(process.cwd(), "public", validImage);
      if (!fs.existsSync(imagePath)) {
        validImage = undefined;
      }
    }

    return {
      ...project,
      image: validImage,
    };
  });

  return <WorkClient projects={validatedProjects} demos={demos} />;
}
