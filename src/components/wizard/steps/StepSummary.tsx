"use client";

import { useState } from "react";
import {
  useGeneratorStore,
  getDependencies,
  getCliCommand,
  getGeneratorConfig,
} from "@/store/generatorStore";
import { useResolvedVersions } from "@/hooks/useResolvedVersions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DownloadIcon, RotateCcwIcon, CopyIcon, CheckIcon } from "lucide-react";
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
  const selectedTemplate = getTemplateById(store.templateId);

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
