"use client";

import { TEMPLATES } from "@/lib/templates";
import { cn } from "@/lib/utils";
import { useGeneratorStore } from "@/store/generatorStore";
import { StepShell } from "./StepShell";

export function StepTemplate() {
  const { templateId, setTemplate } = useGeneratorStore();

  return (
    <StepShell
      title="Choose a Template"
      description="Pick a starting point. You can still customize every setting in the next steps."
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => setTemplate(template.id)}
              className={cn(
                "border-border bg-muted/20 overflow-hidden rounded-xl border text-left transition-all duration-150",
                templateId === template.id
                  ? "border-primary ring-border bg-muted/30 shadow-sm ring-1"
                  : "hover:bg-white/[0.05]",
              )}
            >
              <div className="relative px-4 py-3.5">
                <span className="text-foreground absolute top-3 right-3 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold">
                  {template.badge}
                </span>
                <div className="flex items-center gap-2 pr-16">
                  <span className="text-base">{template.icon}</span>
                  <span className="text-foreground text-sm font-semibold">{template.label}</span>
                </div>
                <p className="text-muted-foreground mt-1 text-xs">{template.description}</p>
                {templateId === template.id && (
                  <div className="bg-foreground absolute right-3 bottom-3 h-2 w-2 rounded-full" />
                )}
              </div>
              <div className="border-border border-t px-4 py-3">
                <p className="text-muted-foreground mb-2 text-[10px] font-semibold tracking-wider uppercase">
                  Includes
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {template.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="bg-muted text-foreground rounded-full px-2 py-1 text-[11px]"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4">
          <p className="text-xs font-semibold text-emerald-400">How templates work</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Templates apply a curated preset to the current starter. They do not lock the project,
            so you can still adjust language, auth, database, styling, and extras afterward.
          </p>
        </div>
      </div>
    </StepShell>
  );
}
