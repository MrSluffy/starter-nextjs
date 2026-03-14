"use client";

import { useGeneratorStore } from "@/store/generatorStore";
import { StepShell, OptionCard } from "./StepShell";

const API_OPTIONS = [
  {
    value: "rest",
    label: "REST",
    desc: "Standard HTTP API with fetch-based client abstraction.",
    badge: "Default",
  },
  {
    value: "graphql",
    label: "GraphQL",
    desc: "Query language for APIs. Includes graphql-request client.",
  },
  { value: "none", label: "None", desc: "No API layer included." },
] as const;

export function StepApiLayer() {
  const store = useGeneratorStore();
  return (
    <StepShell
      title="API Layer"
      description="Select how your application communicates with backend services."
    >
      <div className="grid grid-cols-1 gap-2">
        {API_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            description={opt.desc}
            selected={store.apiLayer === opt.value}
            onClick={() => store.set("apiLayer", opt.value)}
            badge={"badge" in opt ? opt.badge : undefined}
          />
        ))}
      </div>
    </StepShell>
  );
}
