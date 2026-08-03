"use client";

import { useGeneratorStore } from "@/store/generatorStore";
import { StepShell, ToggleCard } from "./StepShell";

const EXTRAS = [
  {
    key: "docker",
    label: "Docker",
    desc: "Dockerfile + docker-compose.yml with optional database service",
    icon: "🐳",
  },
  {
    key: "githubActions",
    label: "GitHub Actions CI",
    desc: "CI workflow: lint, build, and test on push/PR",
    icon: "⚙️",
  },
  {
    key: "openApiClient",
    label: "OpenAPI Client",
    desc: "Type-safe API client generated from OpenAPI spec (openapi-typescript)",
    icon: "📡",
  },
  {
    key: "eslintPrettier",
    label: "ESLint + Prettier",
    desc: "Code linting and formatting with shared config",
    icon: "✨",
  },
  {
    key: "huskyLintStaged",
    label: "Husky + lint-staged",
    desc: "Pre-commit hooks to enforce code quality automatically",
    icon: "🐶",
  },
] as const;

export function StepExtras() {
  const store = useGeneratorStore();
  return (
    <StepShell title="Extras" description="Add optional tooling and integrations.">
      <div className="grid grid-cols-1 gap-2">
        {EXTRAS.map((extra) => (
          <ToggleCard
            key={extra.key}
            label={extra.label}
            description={extra.desc}
            icon={extra.icon}
            checked={store.extras[extra.key as keyof typeof store.extras]}
            onChange={(v) => store.setExtra(extra.key as keyof typeof store.extras, v)}
          />
        ))}
      </div>
    </StepShell>
  );
}
