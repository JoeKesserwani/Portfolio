import type { PortfolioData, Project } from "./types";

const DATABASE_NAME = "folio-studio";
const DATABASE_VERSION = 1;
const RECORD_KEY = "portfolio";

export const starterData: PortfolioData = {
  profile: {
    name: "Alex Morgan",
    role: "Software developer",
    intro: "I build reliable software for the web.",
    about:
      "I’m a software developer focused on building useful, reliable web applications. I enjoy solving practical problems, working across the stack, and turning ideas into software people can depend on.",
    location: "Brooklyn, NY",
    email: "hello@alexmorgan.dev",
    availability: "Open to software opportunities",
    skills: [
      "TypeScript",
      "React",
      "Node.js",
      "PostgreSQL",
    ],
    github: "",
    linkedin: "",
    resume: "",
  },
  projects: [
    {
      id: "atlas",
      title: "Pulse — service health dashboard",
      category: "Full-stack · Monitoring",
      year: "2025",
      description:
        "Example project: a dashboard for checking service health, viewing deployment history, and catching errors before they affect users.",
      stack: ["TypeScript", "React", "Node.js"],
      liveUrl: "",
      sourceUrl: "",
      images: [
        {
          id: "atlas-cover",
          src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85",
          alt: "Analytics dashboard with charts and project metrics",
        },
      ],
    },
    {
      id: "forma",
      title: "QueryKit — typed API client",
      category: "Open source · Developer tools",
      year: "2024",
      description:
        "Example project: a small, typed API client that makes request validation, retries, and error handling predictable across services.",
      stack: ["TypeScript", "Node.js", "Vitest"],
      liveUrl: "",
      sourceUrl: "",
      images: [
        {
          id: "forma-cover",
          src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=85",
          alt: "Code displayed on a developer's computer screen",
        },
      ],
    },
    {
      id: "good-thing",
      title: "Trail Notes — offline-first journal",
      category: "Web app · PWA",
      year: "2024",
      description:
        "Example project: a lightweight personal journal that saves locally, works offline, and syncs entries when the network returns.",
      stack: ["React", "IndexedDB", "Service workers"],
      liveUrl: "",
      sourceUrl: "",
      images: [
        {
          id: "good-thing-cover",
          src: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85",
          alt: "Close-up of a computer circuit board",
        },
      ],
    },
  ],
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("data");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open portfolio storage."));
  });
}

export async function loadPortfolio(): Promise<PortfolioData> {
  const database = await openDatabase();
  try {
    const stored = await new Promise<PortfolioData | undefined>((resolve, reject) => {
      const request = database.transaction("data", "readonly").objectStore("data").get(RECORD_KEY);
      request.onsuccess = () => resolve(request.result as PortfolioData | undefined);
      request.onerror = () => reject(request.error ?? new Error("Could not load portfolio data."));
    });
    return stored ?? structuredClone(starterData);
  } finally {
    database.close();
  }
}

export async function savePortfolio(data: PortfolioData): Promise<void> {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction("data", "readwrite");
      transaction.objectStore("data").put(data, RECORD_KEY);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(transaction.error ?? new Error("Could not save portfolio changes."));
      transaction.onabort = () =>
        reject(transaction.error ?? new Error("Portfolio changes could not be saved."));
    });
  } finally {
    database.close();
  }
}

export function emptyProject(): Project {
  return {
    id: crypto.randomUUID(),
    title: "",
    category: "",
    year: new Date().getFullYear().toString(),
    description: "",
    stack: [],
    liveUrl: "",
    sourceUrl: "",
    images: [],
  };
}
