"use client";

import { useGeneratorStore } from "@/store/generatorStore";
import { StepShell, OptionCard } from "./StepShell";

const ROUTERS = [
  {
    value: "app",
    label: "App Router",
    desc: "Next.js 13+ default. React Server Components, layouts, streaming. Recommended for new projects.",
    badge: "Default",
  },
  {
    value: "pages",
    label: "Pages Router",
    desc: "Classic Next.js routing. getServerSideProps, getStaticProps. Good for legacy or simpler setups.",
  },
] as const;

export function StepArchitecture() {
  const store = useGeneratorStore();
  return (
    <StepShell
      title="Architecture"
      description="Choose the routing paradigm for your Next.js application."
    >
      <div className="space-y-3">
        {ROUTERS.map((r) => (
          <OptionCard
            key={r.value}
            label={r.label}
            description={r.desc}
            selected={store.router === r.value}
            onClick={() => store.set("router", r.value)}
            badge={"badge" in r ? r.badge : undefined}
          />
        ))}

        <div className="mt-4 rounded-xl border border-amber-500/10 bg-amber-500/5 p-4">
          <p className="text-xs font-semibold text-amber-400">ℹ️ Folder Structure</p>
          <p className="text-muted-foreground mt-1 text-xs">
            {store.router === "app"
              ? "Project uses src/app/ with Server Components by default. API routes go in src/app/api/."
              : "Project uses src/pages/ with traditional routing. API routes go in src/pages/api/."}
          </p>
        </div>
      </div>
    </StepShell>
  );
}
