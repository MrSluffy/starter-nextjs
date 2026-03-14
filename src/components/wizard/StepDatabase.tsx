"use client";

import { useGeneratorStore } from "@/store/generatorStore";
import { StepShell, OptionCard } from "./StepShell";

const DB_OPTIONS = [
  {
    value: "postgresql",
    label: "PostgreSQL",
    desc: "Open-source relational database. Production standard.",
  },
  { value: "mongodb", label: "MongoDB", desc: "Document database. Flexible schema, JSON-native." },
  { value: "none", label: "None", desc: "No database included." },
] as const;

const ORM_OPTIONS = [
  {
    value: "prisma",
    label: "Prisma ORM",
    desc: "Type-safe ORM with schema-first design. Great DX.",
    badge: "Popular",
  },
  { value: "drizzle", label: "Drizzle ORM", desc: "Lightweight, SQL-first, fully type-safe ORM." },
  { value: "none", label: "None", desc: "No ORM included." },
] as const;

export function StepDatabase() {
  const store = useGeneratorStore();
  const dbSelected = store.database !== "none";

  return (
    <StepShell title="Database & ORM" description="Configure your data layer.">
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Database
          </p>
          <div className="grid grid-cols-1 gap-2">
            {DB_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.value}
                label={opt.label}
                description={opt.desc}
                selected={store.database === opt.value}
                onClick={() => {
                  store.set("database", opt.value);
                  if (opt.value === "none") store.set("orm", "none");
                }}
              />
            ))}
          </div>
        </div>

        {dbSelected && (
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              ORM
            </p>
            <div className="grid grid-cols-1 gap-2">
              {ORM_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  label={opt.label}
                  description={opt.desc}
                  selected={store.orm === opt.value}
                  onClick={() => store.set("orm", opt.value)}
                  badge={"badge" in opt ? opt.badge : undefined}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </StepShell>
  );
}
