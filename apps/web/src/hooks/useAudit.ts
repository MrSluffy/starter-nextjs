"use client";

import { useState, useCallback } from "react";
import type { GeneratorConfig, Vulnerability } from "@mrsluffy/generator-core/client";

export interface AuditSummary {
  info: number;
  low: number;
  moderate: number;
  high: number;
  critical: number;
}

export interface UseAuditResult {
  versions: Record<string, string> | null;
  vulnerabilities: Vulnerability[];
  summary: AuditSummary | null;
  runAudit: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Provides a runAudit function that POSTs to /api/audit with the given config
 * and returns versions, vulnerabilities, and summary. Call runAudit when the user
 * clicks "Check vulnerabilities" (audit can take 30–60s due to npm install + audit).
 */
export function useAudit(config: GeneratorConfig): UseAuditResult {
  const [versions, setVersions] = useState<Record<string, string> | null>(null);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAudit = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    setVulnerabilities([]);
    setSummary(null);
    setVersions(null);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Vulnerability check failed.");
        return;
      }
      setVersions(data.versions ?? null);
      setVulnerabilities(data.vulnerabilities ?? []);
      setSummary(data.summary ?? null);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  return {
    versions,
    vulnerabilities,
    summary,
    runAudit,
    isLoading,
    error,
  };
}
