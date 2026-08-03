import { strFromU8, unzipSync } from "fflate";

export function unzipTextEntries(zipBuffer: Buffer): Record<string, string> {
  const entries = unzipSync(new Uint8Array(zipBuffer));

  return Object.fromEntries(Object.entries(entries).map(([name, data]) => [name, strFromU8(data)]));
}
