"use client";

import { useGeneratorStore } from "@/store/generatorStore";
import { StepShell, OptionCard } from "./StepShell";

const AUTH_OPTIONS = [
  {
    value: "nextauth",
    label: "NextAuth.js v5",
    desc: "Full-stack auth for Next.js. OAuth, credentials, magic links.",
  },
  {
    value: "jwt",
    label: "Custom JWT",
    desc: "Roll your own JWT auth with jsonwebtoken + bcryptjs.",
  },
  { value: "none", label: "None", desc: "No authentication included." },
] as const;

export function StepAuth() {
  const store = useGeneratorStore();
  return (
    <StepShell
      title="Authentication"
      description="Select how users authenticate in your application."
    >
      <div className="grid grid-cols-1 gap-2">
        {AUTH_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            description={opt.desc}
            selected={store.auth === opt.value}
            onClick={() => store.set("auth", opt.value)}
          />
        ))}
      </div>
      {store.auth === "nextauth" && (
        <div className="border-border bg-muted/50 mt-4 rounded-xl border p-4">
          <p className="text-foreground text-xs font-semibold">📌 Setup Required</p>
          <p className="text-muted-foreground mt-1 text-xs">
            You&apos;ll need to set NEXTAUTH_SECRET and NEXTAUTH_URL in your .env.local file.
          </p>
        </div>
      )}
    </StepShell>
  );
}
