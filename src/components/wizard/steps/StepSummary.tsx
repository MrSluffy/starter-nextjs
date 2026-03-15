"use client";

import { useState } from "react";
import {
  useGeneratorStore,
  getDependencies,
  getCliCommand,
  getGeneratorConfig,
} from "@/store/generatorStore";
import { useResolvedVersions } from "@/hooks/useResolvedVersions";
import { useAudit } from "@/hooks/useAudit";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DownloadIcon,
  RotateCcwIcon,
  CopyIcon,
  CheckIcon,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getTemplateById } from "@/lib/templates";

const LABEL_MAP: Record<string, string> = {
  projectName: "Project",
  packageManager: "Package Manager",
  language: "Language",
  nextVersion: "Next.js",
  router: "Router",
  styling: "Styling",
  stateManagement: "State",
  apiLayer: "API",
  auth: "Auth",
  database: "Database",
  orm: "ORM",
  testing: "Testing",
};

const EXTRA_LABELS: Record<string, string> = {
  docker: "Docker",
  githubActions: "GitHub Actions CI",
  openApiClient: "OpenAPI Client",
  eslintPrettier: "ESLint + Prettier",
  huskyLintStaged: "Husky + lint-staged",
};

export function StepSummary() {
  const store = useGeneratorStore();
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const config = getGeneratorConfig(store);
  const { versions } = useResolvedVersions(config);
  const {
    vulnerabilities,
    summary,
    runAudit,
    isLoading: auditLoading,
    error: auditError,
  } = useAudit(config);
  const selectedTemplate = getTemplateById(store.templateId);
  const totalVulns =
    summary && "critical" in summary
      ? (summary.critical ?? 0) +
        (summary.high ?? 0) +
        (summary.moderate ?? 0) +
        (summary.low ?? 0) +
        (summary.info ?? 0)
      : 0;

  const cliCmd = getCliCommand(config);
  const depGroups = getDependencies(config, versions);

  const enabledExtras = Object.entries(store.extras)
    .filter(([, v]) => v)
    .map(([k]) => EXTRA_LABELS[k]);

  async function handleDownload() {
    setDownloading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Generation failed.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${store.projectName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(cliCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const summaryFields = Object.entries(LABEL_MAP).map(([key, label]) => {
    let value = String(store[key as keyof typeof store]);
    if (key === "nextVersion" && versions?.next) {
      value = `${value} (${versions.next})`;
    }
    return { label, value };
  });

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="border-border border-b pb-6">
        <h1 className="text-foreground text-xl font-bold">Review & Generate</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Review your configuration and download your project.
        </p>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto">
        {/* Config summary */}
        <div className="border-border bg-muted/30 rounded-xl border p-4">
          <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
            Configuration
          </p>
          <div className="mb-4 flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-black/10 px-3 py-2">
            <span className="text-muted-foreground text-xs">Template</span>
            <Badge variant="secondary" className="bg-muted text-foreground/80 border-none text-xs">
              {selectedTemplate.label}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {summaryFields.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground text-xs">{label}</span>
                <Badge
                  variant="secondary"
                  className="bg-muted text-foreground/80 border-none text-xs font-normal"
                >
                  {value}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Extras */}
        {enabledExtras.length > 0 && (
          <div className="border-border bg-muted/30 rounded-xl border p-4">
            <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
              Extras Enabled
            </p>
            <div className="flex flex-wrap gap-2">
              {enabledExtras.map((label) => (
                <Badge key={label} className="border-border bg-muted/50 text-foreground text-xs">
                  ✓ {label}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* CLI command */}
        <div className="border-border bg-muted/50 rounded-xl border p-4">
          <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
            Equivalent CLI Command
          </p>
          <div className="flex items-start gap-2">
            <code className="text-foreground flex-1 font-mono text-xs leading-relaxed break-all whitespace-pre-wrap">
              {cliCmd}
            </code>
            <button
              onClick={handleCopy}
              className="text-muted-foreground hover:bg-accent hover:text-foreground/90 shrink-0 rounded-lg p-2 transition-all"
              title="Copy to clipboard"
            >
              {copied ? (
                <CheckIcon className="text-foreground h-4 w-4" />
              ) : (
                <CopyIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Dependency count */}
        <div className="border-border bg-muted/30 rounded-xl border p-4">
          <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
            Dependencies ({depGroups.reduce((a, g) => a + g.deps.length, 0)} packages)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {depGroups
              .flatMap((g) => g.deps)
              .map((dep) => (
                <Badge
                  key={dep}
                  variant="secondary"
                  className="border-border bg-muted/50 text-foreground/70 font-mono text-[11px] font-normal"
                  title={dep}
                >
                  {dep}
                </Badge>
              ))}
          </div>
        </div>

        {/* Vulnerability check */}
        <div className="border-border bg-muted/30 rounded-xl border p-4">
          <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
            Vulnerability check
          </p>
          <p className="text-muted-foreground mb-3 text-xs">
            Check the dependencies for known security issues before downloading.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={runAudit}
            disabled={auditLoading}
            className="border-border gap-2"
          >
            {auditLoading ? (
              <>Checking…</>
            ) : totalVulns > 0 ? (
              <>
                <ShieldAlert className="h-3.5 w-3.5" />
                Re-check vulnerabilities
              </>
            ) : vulnerabilities.length > 0 ? (
              <>
                <ShieldAlert className="h-3.5 w-3.5" />
                Re-check vulnerabilities
              </>
            ) : summary ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                No known vulnerabilities
              </>
            ) : (
              <>
                <ShieldAlert className="h-3.5 w-3.5" />
                Check vulnerabilities
              </>
            )}
          </Button>
          {auditError && <p className="text-destructive mt-2 text-xs">{auditError}</p>}
          {totalVulns > 0 && summary && (
            <div className="mt-3 space-y-2">
              <p className="text-foreground/90 text-xs font-medium">
                {totalVulns} known vulnerability {totalVulns === 1 ? "found" : "found"} (critical:{" "}
                {summary.critical ?? 0}, high: {summary.high ?? 0}, moderate:{" "}
                {summary.moderate ?? 0}, low: {summary.low ?? 0})
              </p>
              <ul className="border-border bg-muted/50 max-h-40 space-y-1 overflow-y-auto rounded-md border p-2 text-xs">
                {vulnerabilities.slice(0, 20).map((v, i) => (
                  <li
                    key={`${v.package}-${i}`}
                    className="flex flex-wrap items-center gap-x-2 gap-y-0.5"
                  >
                    <span className="text-foreground/90 font-mono">{v.package}</span>
                    <Badge
                      variant="secondary"
                      className={
                        v.severity === "critical" || v.severity === "high"
                          ? "border-red-500/50 bg-red-500/10 text-[10px] text-red-400"
                          : v.severity === "moderate"
                            ? "border-amber-500/50 bg-amber-500/10 text-[10px] text-amber-400"
                            : "text-[10px]"
                      }
                    >
                      {v.severity}
                    </Badge>
                    <span className="text-muted-foreground truncate">{v.title}</span>
                    {v.url && (
                      <a
                        href={v.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Details
                      </a>
                    )}
                  </li>
                ))}
              </ul>
              {vulnerabilities.length > 20 && (
                <p className="text-muted-foreground text-xs">
                  … and {vulnerabilities.length - 20} more. Run{" "}
                  <code className="bg-muted rounded px-1">npm audit</code> after install for the
                  full report.
                </p>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-400">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="border-border flex items-center gap-3 border-t pt-6">
        <Button
          variant="outline"
          onClick={store.reset}
          className="border-border bg-muted text-muted-foreground hover:bg-accent hover:text-foreground gap-2"
        >
          <RotateCcwIcon className="h-4 w-4" />
          Reset
        </Button>
        <Button
          onClick={handleDownload}
          disabled={downloading}
          className={cn(
            "bg-primary text-primary-foreground flex-1 gap-2 font-semibold transition-all",
            "hover:bg-primary/90",
            downloading && "animate-pulse cursor-wait",
          )}
        >
          <DownloadIcon className="h-4 w-4" />
          {downloading ? "Generating ZIP…" : `Download ${store.projectName}.zip`}
        </Button>
      </div>
    </div>
  );
}
