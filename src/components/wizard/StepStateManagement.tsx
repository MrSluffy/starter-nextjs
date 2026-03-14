"use client";

import { useGeneratorStore } from "@/store/generatorStore";
import { StepShell, OptionCard } from "./StepShell";

const STATE_OPTIONS = [
  {
    value: "zustand",
    label: "Zustand",
    desc: "Lightweight, unopinionated state management. Perfect for most apps.",
    badge: "Recommended",
  },
  {
    value: "redux-toolkit",
    label: "Redux Toolkit",
    desc: "Industry standard for complex state with time-travel debugging.",
  },
  {
    value: "react-context",
    label: "React Context",
    desc: "Built-in React solution. Best for small, infrequently updating state.",
  },
  { value: "none", label: "None", desc: "No state management library included." },
] as const;

export function StepStateManagement() {
  const store = useGeneratorStore();
  return (
    <StepShell
      title="State Management"
      description="Choose how your application manages global state."
    >
      <div className="grid grid-cols-1 gap-2">
        {STATE_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            description={opt.desc}
            selected={store.stateManagement === opt.value}
            onClick={() => store.set("stateManagement", opt.value)}
            badge={"badge" in opt ? opt.badge : undefined}
          />
        ))}
      </div>
    </StepShell>
  );
}
