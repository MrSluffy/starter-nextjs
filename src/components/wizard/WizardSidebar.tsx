"use client";

import { useGeneratorStore } from "@/store/generatorStore";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

const STEP_LABELS = [
  "Template",
  "General",
  "Architecture",
  "Styling",
  "State",
  "API Layer",
  "Auth",
  "Database",
  "Testing",
  "Extras",
  "Review",
];

export function WizardSidebar() {
  const { step, setStep, totalSteps } = useGeneratorStore();

  return (
    <nav className="sticky top-6 flex flex-col gap-1">
      <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
        Configure
      </p>
      {STEP_LABELS.map((label, idx) => {
        const isActive = idx === step;
        const isDone = idx < step;
        return (
          <button
            key={label}
            onClick={() => setStep(idx)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-150",
              isActive
                ? "text-foreground bg-muted ring-border bg-gradient-to-r shadow-sm ring-1"
                : isDone
                  ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all",
                isActive
                  ? "text-primary-foreground from-primary to-primary bg-gradient-to-br"
                  : isDone
                    ? "text-foreground bg-emerald-500/20"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {isDone ? <CheckIcon className="h-3 w-3" /> : idx + 1}
            </span>
            {label}
          </button>
        );
      })}

      <div className="border-border bg-muted/30 mt-4 rounded-xl border p-3">
        <div className="text-muted-foreground mb-2 flex items-center justify-between text-xs">
          <span>Progress</span>
          <span>{Math.round((step / (totalSteps - 1)) * 100)}%</span>
        </div>
        <div className="bg-muted h-1.5 overflow-hidden rounded-full">
          <div
            className="from-primary to-primary h-full rounded-full bg-gradient-to-r transition-all duration-500"
            style={{ width: `${Math.max(2, (step / (totalSteps - 1)) * 100)}%` }}
          />
        </div>
      </div>
    </nav>
  );
}
