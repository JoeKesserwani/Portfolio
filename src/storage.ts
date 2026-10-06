import { getSupabaseClient } from "./supabase";
import type { PortfolioData, Project, ProjectImage } from "./types";

const DATABASE_NAME = "folio-studio";
const DATABASE_VERSION = 1;
const RECORD_KEY = "portfolio";
const PORTFOLIO_ID = "main";
const IMAGE_BUCKET = "portfolio-images";

export interface PortfolioSnapshot {
  data: PortfolioData;
  initialized: boolean;
}

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

function openLegacyDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("data");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open saved browser data."));
  });
}

export async function loadLegacyPortfolio(): Promise<PortfolioData | null> {
  const database = await openLegacyDatabase();
  try {
    return await new Promise<PortfolioData | null>((resolve, reject) => {
      const request = database.transaction("data", "readonly").objectStore("data").get(RECORD_KEY);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error ?? new Error("Could not read saved browser data."));
    });
  } finally {
    database.close();
  }
}

export async function loadPortfolio(): Promise<PortfolioSnapshot> {
  const { data, error } = await getSupabaseClient()
    .from("portfolio_content")
    .select("content")
    .eq("id", PORTFOLIO_ID)
    .maybeSingle();
  if (error) throw new Error(`Portfolio data could not be loaded: ${error.message}`);
  if (!data) return { data: structuredClone(starterData), initialized: false };
  return { data: data.content as PortfolioData, initialized: true };
}

function safePathSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function fileExtension(blob: Blob): string {
  const extensionByType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/avif": "avif",
    "image/svg+xml": "svg",
  };
  return extensionByType[blob.type] ?? "img";
}

async function uploadBlobImages(data: PortfolioData): Promise<{ data: PortfolioData; uploadedPaths: string[] }> {
  const client = getSupabaseClient();
  const uploadedPaths: string[] = [];
  try {
    const projects: Project[] = [];
    for (const project of data.projects) {
      const images: ProjectImage[] = [];
      for (const image of project.images) {
        if (typeof image.src === "string") {
          images.push(image);
          continue;
        }
        const path = `projects/${safePathSegment(project.id)}/${safePathSegment(image.id)}-${crypto.randomUUID()}.${fileExtension(image.src)}`;
        const { error } = await client.storage.from(IMAGE_BUCKET).upload(path, image.src, {
          contentType: image.src.type || "application/octet-stream",
          upsert: false,
        });
        if (error) throw new Error(`Could not upload “${image.alt || project.title}”: ${error.message}`);
        uploadedPaths.push(path);
        const { data: publicUrl } = client.storage.from(IMAGE_BUCKET).getPublicUrl(path);
        images.push({ ...image, src: publicUrl.publicUrl });
      }
      projects.push({ ...project, images });
    }
    return { data: { ...data, projects }, uploadedPaths };
  } catch (error) {
    const cleanupError = await removeStoragePaths(uploadedPaths);
    const message = error instanceof Error ? error.message : "Project images could not be uploaded.";
    throw new Error(cleanupError ? `${message} Some uploaded files could not be cleaned up: ${cleanupError}` : message);
  }
}

function storagePathFromPublicUrl(src: string): string | null {
  const marker = `/storage/v1/object/public/${IMAGE_BUCKET}/`;
  const markerIndex = src.indexOf(marker);
  return markerIndex < 0 ? null : src.slice(markerIndex + marker.length);
}

async function removeStoragePaths(paths: string[]): Promise<string | null> {
  if (!paths.length) return null;
  const { error } = await getSupabaseClient().storage.from(IMAGE_BUCKET).remove(paths);
  return error?.message ?? null;
}

function managedImagePaths(data: PortfolioData | null): Set<string> {
  const paths = new Set<string>();
  for (const project of data?.projects ?? []) {
    for (const image of project.images) {
      if (typeof image.src !== "string") continue;
      const path = storagePathFromPublicUrl(image.src);
      if (path) paths.add(path);
    }
  }
  return paths;
}

async function getStoredPortfolio(): Promise<PortfolioData | null> {
  const { data, error } = await getSupabaseClient()
    .from("portfolio_content")
    .select("content")
    .eq("id", PORTFOLIO_ID)
    .maybeSingle();
  if (error) throw new Error(`Existing portfolio data could not be checked: ${error.message}`);
  return data ? data.content as PortfolioData : null;
}

export async function initializePortfolio(data: PortfolioData): Promise<PortfolioData> {
  const client = getSupabaseClient();
  if (await getStoredPortfolio()) {
    throw new Error("A shared portfolio already exists. Reload the page to get the latest version.");
  }
  const uploaded = await uploadBlobImages(data);
  const { error } = await client.from("portfolio_content").insert({
    id: PORTFOLIO_ID,
    content: uploaded.data,
  });
  if (error) {
    const cleanupError = await removeStoragePaths(uploaded.uploadedPaths);
    const message = `The shared portfolio could not be initialized: ${error.message}`;
    throw new Error(cleanupError ? `${message} Some uploaded files could not be cleaned up: ${cleanupError}` : message);
  }
  return uploaded.data;
}

export async function savePortfolio(data: PortfolioData): Promise<PortfolioData> {
  const client = getSupabaseClient();
  const previousData = await getStoredPortfolio();
  const uploaded = await uploadBlobImages(data);
  const { error } = await client.from("portfolio_content").upsert({
    id: PORTFOLIO_ID,
    content: uploaded.data,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    const cleanupError = await removeStoragePaths(uploaded.uploadedPaths);
    const message = `Portfolio changes could not be saved: ${error.message}`;
    throw new Error(cleanupError ? `${message} Some uploaded files could not be cleaned up: ${cleanupError}` : message);
  }

  const nextPaths = managedImagePaths(uploaded.data);
  const removedPaths = [...managedImagePaths(previousData)].filter((path) => !nextPaths.has(path));
  const cleanupError = await removeStoragePaths(removedPaths);
  if (cleanupError) {
    throw new Error(`Portfolio changes were saved, but removed photos could not be cleaned up: ${cleanupError}`);
  }
  return uploaded.data;
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
