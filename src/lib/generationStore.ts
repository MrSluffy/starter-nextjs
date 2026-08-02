import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

export interface GenerationRecord {
  projectName: string; // 1-128 chars, pattern: [a-z0-9-]
  generatedAt: string; // ISO 8601 UTC: "YYYY-MM-DDTHH:mm:ss.sssZ"
}

export interface GenerationStoreData {
  count: number; // Non-negative integer, total all-time generations
  generations: GenerationRecord[]; // Max 10,000 entries (FIFO)
}

const MAX_GENERATIONS = 10_000;
const DEFAULT_STORE_FILE = "generation-data.json";
const DEFAULT_STORE_DIR = "data";

/** Resolve the store file path from env or default. */
export function getStorePath(): string {
  if (process.env.GENERATION_STORE_PATH) {
    const envPath = process.env.GENERATION_STORE_PATH;
    // Prevent path traversal
    if (envPath.includes("..")) {
      return path.join(process.cwd(), DEFAULT_STORE_DIR, DEFAULT_STORE_FILE);
    }
    return envPath;
  }
  // Statically scoped to 'data' subfolder so Turbopack won't trace the whole project
  return path.join(process.cwd(), DEFAULT_STORE_DIR, DEFAULT_STORE_FILE);
}

/** Read the store from disk. Returns {count: 0, generations: []} on any error or invalid data. */
export async function readStore(): Promise<GenerationStoreData> {
  try {
    const filePath = getStorePath();
    const content = await readFile(/*turbopackIgnore: true*/ filePath, "utf-8");
    const data = JSON.parse(content);

    // Validate structure before trusting the data
    if (
      typeof data !== "object" ||
      data === null ||
      typeof data.count !== "number" ||
      data.count < 0 ||
      !Array.isArray(data.generations)
    ) {
      return { count: 0, generations: [] };
    }

    return data as GenerationStoreData;
  } catch {
    return { count: 0, generations: [] };
  }
}

let writeLock: Promise<void> = Promise.resolve();

/** Increment count, append record, evict oldest if at cap. Serialized via mutex. */
export function recordGeneration(projectName: string): Promise<void> {
  // Validate projectName: 1-128 chars, only [a-z0-9-]
  if (!projectName || projectName.length > 128 || !/^[a-z0-9-]+$/.test(projectName)) {
    return Promise.resolve();
  }

  const release = writeLock;
  let resolve: () => void;
  writeLock = new Promise<void>((r) => {
    resolve = r;
  });

  return release.then(async () => {
    try {
      const store = await readStore();

      store.count += 1;

      const record: GenerationRecord = {
        projectName,
        generatedAt: new Date().toISOString(),
      };

      store.generations.push(record);

      // FIFO eviction: remove oldest entries if over cap
      if (store.generations.length > MAX_GENERATIONS) {
        store.generations = store.generations.slice(store.generations.length - MAX_GENERATIONS);
      }

      const filePath = getStorePath();
      const dir = path.dirname(filePath);

      try {
        await mkdir(dir, { recursive: true });
        await writeFile(
          /*turbopackIgnore: true*/ filePath,
          JSON.stringify(store, null, 2),
          "utf-8",
        );
      } catch (err) {
        console.error("Failed to write generation store:", err);
      }
    } finally {
      resolve!();
    }
  });
}
