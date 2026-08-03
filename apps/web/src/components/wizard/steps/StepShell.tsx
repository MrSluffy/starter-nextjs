"use client";

import { ReactNode } from "react";
import { useGeneratorStore } from "@/store/generatorStore";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepShellProps {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}

export function StepShell({ title, description, children, className }: StepShellProps) {
  const { step, totalSteps, nextStep, prevStep } = useGeneratorStore();
  const isFirst = step === 0;
  const isLast = step === totalSteps - 1;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-border mb-6 border-b pb-6">
        <h1 className="text-foreground text-xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      </div>

      {/* Content */}
      <div className={cn("flex-1 overflow-y-auto", className)}>{children}</div>

      {/* Nav buttons */}
      <div className="border-border mt-6 flex items-center justify-between border-t pt-6">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={isFirst}
          className="border-border bg-muted text-foreground/80 hover:bg-accent hover:text-foreground gap-2 disabled:opacity-30"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Back
        </Button>
        {!isLast && (
          <Button
            onClick={nextStep}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            Next
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Shared option card ─────────────────────────────────────────────────────────

interface OptionCardProps {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  icon?: ReactNode;
  badge?: string;
}

export function OptionCard({
  label,
  description,
  selected,
  onClick,
  icon,
  badge,
}: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex w-full flex-col gap-1 rounded-xl border px-4 py-3.5 text-left transition-all duration-150",
        selected
          ? "border-primary bg-muted/20 ring-border shadow-sm ring-1"
          : "border-border bg-muted/30 hover:border-border hover:bg-white/[0.05]",
      )}
    >
      {badge && (
        <span className="text-foreground absolute top-3 right-3 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold">
          {badge}
        </span>
      )}
      <div className="flex items-center gap-2">
        {icon && <span className="text-base">{icon}</span>}
        <span
          className={cn("text-sm font-semibold", selected ? "text-foreground" : "text-foreground")}
        >
          {label}
        </span>
      </div>
      {description && <p className="text-muted-foreground text-xs">{description}</p>}
      {selected && <div className="bg-foreground absolute right-3 bottom-3 h-2 w-2 rounded-full" />}
    </button>
  );
}

interface ToggleCardProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon?: string;
}

export function ToggleCard({ label, description, checked, onChange, icon }: ToggleCardProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-150",
        checked
          ? "border-primary bg-muted/20 ring-border shadow-sm ring-1"
          : "border-border bg-muted/30 hover:border-border hover:bg-white/[0.05]",
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all",
          checked ? "border-primary bg-primary" : "bg-muted border-border",
        )}
      >
        {checked && <span className="text-primary-foreground text-[10px] font-bold">✓</span>}
      </div>
      <div>
        <p className={cn("text-sm font-semibold", checked ? "text-foreground" : "text-foreground")}>
          {icon} {label}
        </p>
        {description && <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>}
      </div>
    </button>
  );
}
