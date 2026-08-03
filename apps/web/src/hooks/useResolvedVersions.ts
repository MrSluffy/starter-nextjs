"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import type { GeneratorConfig } from "@mrsluffy/generator-core/client";

export interface UseResolvedVersionsResult {
  versions: Record<string, string> | null;
  isLoading: boolean;
  error: string | null;
}

const DEBOUNCE_MS = 500;

/**
 * Fetches resolved latest versions from the npm registry for the given generator config.
 * Debounced and only re-runs when the serialized config (configKey) actually changes —
 * not on every render, since config is a new object reference each time.
 */
export function useResolvedVersions(config: GeneratorConfig): UseResolvedVersionsResult {
  const [versions, setVersions] = useState<Record<string, string> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  });

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
        extras: {
          docker: config.extras.docker,
          githubActions: config.extras.githubActions,
          openApiClient: config.extras.openApiClient,
          eslintPrettier: config.extras.eslintPrettier,
          huskyLintStaged: config.extras.huskyLintStaged,
        },
      }),
    [
      config.nextVersion,
      config.language,
      config.styling,
      config.stateManagement,
      config.apiLayer,
      config.auth,
      config.database,
      config.orm,
      config.testing,
      config.extras.docker,
      config.extras.githubActions,
      config.extras.openApiClient,
      config.extras.eslintPrettier,
      config.extras.huskyLintStaged,
    ],
  );

  const cancelledRef = useRef(false);

  const fetchVersions = useCallback(() => {
    cancelledRef.current = false;
    const cfg = configRef.current;
    setError(null);
    setIsLoading(true);

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
        if (!cancelledRef.current) {
          setVersions(data.versions);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelledRef.current) {
          setVersions(null);
          setError(err instanceof Error ? err.message : "Failed to load versions");
        }
      })
      .finally(() => {
        if (!cancelledRef.current) setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVersions();
    }, DEBOUNCE_MS);

    return () => {
      cancelledRef.current = true;
      clearTimeout(timer);
    };
  }, [configKey, fetchVersions]);

  return { versions, isLoading, error };
}
