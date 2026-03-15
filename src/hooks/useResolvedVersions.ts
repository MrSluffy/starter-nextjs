"use client";

import { useState, useEffect, useMemo } from "react";
import type { GeneratorConfig } from "@/store/generatorStore";

export interface UseResolvedVersionsResult {
  versions: Record<string, string> | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Fetches resolved latest versions from the npm registry for the given generator config.
 * Used to display actual version numbers (e.g. Next.js 16.1.6) in the UI.
 */
export function useResolvedVersions(config: GeneratorConfig): UseResolvedVersionsResult {
  const [versions, setVersions] = useState<Record<string, string> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const configKey = useMemo(
    () =>
      JSON.stringify({
        nextVersion: config.nextVersion,
        language: config.language,
        styling: config.styling,
        stateManagement: config.stateManagement,
        apiLayer: config.apiLayer,
        auth: config.auth,
        database: config.database,
        orm: config.orm,
        testing: config.testing,
        extras: config.extras,
      }),
    [config],
  );

  useEffect(() => {
    let cancelled = false;
    const cfg = config;
    queueMicrotask(() => {
      setError(null);
      setIsLoading(true);
    });

    fetch("/api/versions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cfg),
    })
      .then((res) => {
        if (!res.ok)
          return res.json().then((data) => Promise.reject(new Error(data.error ?? "Failed")));
        return res.json();
      })
      .then((data: { versions: Record<string, string> }) => {
        if (!cancelled) {
          setVersions(data.versions);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setVersions(null);
          setError(err instanceof Error ? err.message : "Failed to load versions");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [configKey, config]);

  return { versions, isLoading, error };
}
