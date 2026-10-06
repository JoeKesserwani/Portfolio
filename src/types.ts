export interface Profile {
  name: string;
  role: string;
  intro: string;
  about: string;
  location: string;
  email: string;
  availability: string;
  skills: string[];
  github: string;
  linkedin: string;
  resume: string;
}

export interface ProjectImage {
  id: string;
  src: string | Blob;
  alt: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  year: string;
  description: string;
  stack: string[];
  liveUrl: string;
  sourceUrl: string;
  images: ProjectImage[];
}

export interface PortfolioData {
  profile: Profile;
  projects: Project[];
}
