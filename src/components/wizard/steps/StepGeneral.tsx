"use client";

import { useGeneratorStore, NEXT_VERSIONS } from "@/store/generatorStore";
import { getTemplateById } from "@/lib/templates";
import { StepShell, OptionCard } from "./StepShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PKG_MANAGERS = [
  { value: "npm", label: "npm", desc: "Node Package Manager (default)" },
  { value: "yarn", label: "Yarn", desc: "Fast, reliable, secure" },
  { value: "pnpm", label: "pnpm", desc: "Efficient disk space usage" },
] as const;

const LANGUAGES = [
  { value: "typescript", label: "TypeScript", desc: "Strongly typed", badge: "Recommended" },
  { value: "javascript", label: "JavaScript", desc: "Dynamic typing" },
] as const;

export function StepGeneral() {
  const store = useGeneratorStore();
  const selectedTemplate = getTemplateById(store.templateId);

  return (
    <StepShell
      title="General Settings"
      description="Configure the basic details of your new Next.js project."
    >
      <div className="space-y-6">
        {store.templateId !== "custom" && (
          <div className="rounded-xl border border-sky-500/10 bg-sky-500/5 p-4">
            <p className="text-xs font-semibold text-sky-400">
              Starting from {selectedTemplate.label}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              This preset already applied a recommended stack. You can override anything below.
            </p>
          </div>
        )}

        {/* Project name */}
        <div className="space-y-2">
          <Label className="text-foreground/90 text-sm font-semibold">Project Name</Label>
          <Input
            value={store.projectName}
            onChange={(e) =>
              store.set("projectName", e.target.value.toLowerCase().replace(/\s+/g, "-"))
            }
            placeholder="my-next-app"
            className="border-border bg-muted text-foreground placeholder:text-foreground/25 focus:border-primary/60"
          />
          <p className="text-muted-foreground text-xs">
            Lowercase, hyphens only. e.g. my-awesome-app
          </p>
        </div>

        {/* Package manager */}
        <div className="space-y-2">
          <Label className="text-foreground/90 text-sm font-semibold">Package Manager</Label>
          <div className="grid grid-cols-3 gap-2">
            {PKG_MANAGERS.map((pm) => (
              <OptionCard
                key={pm.value}
                label={pm.label}
                description={pm.desc}
                selected={store.packageManager === pm.value}
                onClick={() => store.set("packageManager", pm.value)}
              />
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Label className="text-foreground/90 text-sm font-semibold">Language</Label>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map((lang) => (
              <OptionCard
                key={lang.value}
                label={lang.label}
                description={lang.desc}
                selected={store.language === lang.value}
                onClick={() => store.set("language", lang.value)}
                badge={"badge" in lang ? lang.badge : undefined}
              />
            ))}
          </div>
        </div>

        {/* Next.js version */}
        <div className="space-y-2">
          <Label className="text-foreground/90 text-sm font-semibold">Next.js Version</Label>
          <div className="grid grid-cols-2 gap-2">
            {NEXT_VERSIONS.map((v) => (
              <OptionCard
                key={v}
                label={v}
                selected={store.nextVersion === v}
                onClick={() => store.set("nextVersion", v)}
                badge={v.includes("latest") ? "Latest" : v.includes("LTS") ? "LTS" : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </StepShell>
  );
}
