export interface GenerationRecord {
  projectName: string; // 1-128 chars, pattern: [a-z0-9-]
  generatedAt: string; // ISO 8601 UTC: "YYYY-MM-DDTHH:mm:ss.sssZ"
}

export interface GenerationStoreData {
  count: number; // Non-negative integer, total all-time generations
  generations: GenerationRecord[]; // Max 10,000 entries (FIFO)
}

const MAX_GENERATIONS = 10_000;
const GIST_FILENAME = "generation-data.json";

function getGistConfig() {
  const token = process.env.GITHUB_GIST_TOKEN;
  const gistId = process.env.GITHUB_GIST_ID;
  if (!token || !gistId) {
    return null;
  }
  return { token, gistId };
}

/** Read the store from the GitHub Gist. Returns {count: 0, generations: []} on any error. */
export async function readStore(): Promise<GenerationStoreData> {
  try {
    const config = getGistConfig();
    if (!config) {
      return { count: 0, generations: [] };
    }

    const res = await fetch(`https://api.github.com/gists/${config.gistId}`, {
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return { count: 0, generations: [] };
    }

    const gist = await res.json();
    const file = gist.files?.[GIST_FILENAME];
    if (!file || !file.content) {
      return { count: 0, generations: [] };
    }

    const data = JSON.parse(file.content);

    // Validate structure
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

/** Write the store to the GitHub Gist. */
async function writeStore(store: GenerationStoreData): Promise<void> {
  const config = getGistConfig();
  if (!config) {
    console.error("Missing GITHUB_GIST_TOKEN or GITHUB_GIST_ID env vars");
    return;
  }

  const res = await fetch(`https://api.github.com/gists/${config.gistId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      files: {
        [GIST_FILENAME]: {
          content: JSON.stringify(store, null, 2),
        },
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`Failed to update Gist: ${res.status} ${body}`);
  }
}

let writeLock: Promise<void> = Promise.resolve();

/** Increment count, append record, evict oldest if at cap. Serialized via mutex. */
export async function recordGeneration(projectName: string): Promise<void> {
  // Validate projectName: 1-128 chars, only [a-z0-9-]
  if (!projectName || projectName.length > 128 || !/^[a-z0-9-]+$/.test(projectName)) {
    return;
  }

  const release = writeLock;
  let resolve: () => void;
  writeLock = new Promise<void>((r) => {
    resolve = r;
  });

  await release;
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

    await writeStore(store);
  } catch (err) {
    console.error("Failed to record generation:", err);
  } finally {
    resolve!();
  }
}
