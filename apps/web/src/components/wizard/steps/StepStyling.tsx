"use client";

import { useGeneratorStore } from "@/store/generatorStore";
import { StepShell, OptionCard } from "./StepShell";

const STYLING_OPTIONS = [
  {
    value: "tailwind",
    label: "Tailwind CSS",
    desc: "Utility-first CSS framework. Highly composable.",
    badge: "Popular",
  },
  { value: "css-modules", label: "CSS Modules", desc: "Scoped CSS with zero runtime overhead." },
  {
    value: "styled-components",
    label: "Styled Components",
    desc: "CSS-in-JS with component-level styles.",
  },
  { value: "sass", label: "Sass / SCSS", desc: "CSS preprocessor with variables and nesting." },
  { value: "none", label: "None", desc: "Plain CSS only." },
] as const;

export function StepStyling() {
  const store = useGeneratorStore();
  return (
    <StepShell title="Styling" description="Select the styling solution for your project.">
      <div className="grid grid-cols-1 gap-2">
        {STYLING_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            description={opt.desc}
            selected={store.styling === opt.value}
            onClick={() => store.set("styling", opt.value)}
            badge={"badge" in opt ? opt.badge : undefined}
          />
        ))}
      </div>
    </StepShell>
  );
}
