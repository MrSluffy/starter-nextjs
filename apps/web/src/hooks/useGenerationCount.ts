"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface UseGenerationCountResult {
  count: number | null; // null = not yet loaded / failed with no previous value
  isLoading: boolean;
  refetch: () => void;
}

/** Module-level variable to persist last known count across re-renders within the session */
let lastKnownCount: number | null = null;

export function useGenerationCount(): UseGenerationCountResult {
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchCount = useCallback(async () => {
    setIsLoading(true);

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const res = await fetch("/api/generation-count", {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const newCount = typeof data.count === "number" ? data.count : null;

      if (newCount !== null) {
        lastKnownCount = newCount;
        setCount(newCount);
      } else {
        setCount(lastKnownCount);
      }
    } catch {
      clearTimeout(timeoutId);
      // On failure or timeout, return last known count or null
      setCount(lastKnownCount);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCount();

    return () => {
      // Cleanup: abort any pending request on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchCount]);

  return { count, isLoading, refetch: fetchCount };
}
