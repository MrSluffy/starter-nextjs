"use client";

import { useGeneratorStore } from "@/store/generatorStore";
import { StepShell, OptionCard } from "./StepShell";

const TESTING_OPTIONS = [
  {
    value: "jest",
    label: "Jest + RTL",
    desc: "Unit/integration tests with React Testing Library.",
    badge: "Popular",
  },
  { value: "vitest", label: "Vitest + RTL", desc: "Lightning-fast Vite-native test runner." },
  { value: "playwright", label: "Playwright", desc: "End-to-end browser testing by Microsoft." },
  { value: "cypress", label: "Cypress", desc: "E2E and component testing with visual debugging." },
  { value: "none", label: "None", desc: "No test framework included." },
] as const;

export function StepTesting() {
  const store = useGeneratorStore();
  return (
    <StepShell title="Testing" description="Choose a testing framework for your project.">
      <div className="grid grid-cols-1 gap-2">
        {TESTING_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            description={opt.desc}
            selected={store.testing === opt.value}
            onClick={() => store.set("testing", opt.value)}
            badge={"badge" in opt ? opt.badge : undefined}
          />
        ))}
      </div>
    </StepShell>
  );
}
