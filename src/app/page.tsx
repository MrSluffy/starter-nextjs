"use client";

import { useEffect } from "react";
import { useGeneratorStore } from "@/store/generatorStore";
import { useGenerationCount } from "@/hooks/useGenerationCount";
import { GenerationCounter } from "@/components/GenerationCounter";
import { WizardSidebar } from "@/components/wizard/WizardSidebar";
import { StepTemplate } from "@/components/wizard/steps/StepTemplate";
import { StepGeneral } from "@/components/wizard/steps/StepGeneral";
import { StepArchitecture } from "@/components/wizard/steps/StepArchitecture";
import { StepStyling } from "@/components/wizard/steps/StepStyling";
import { StepStateManagement } from "@/components/wizard/steps/StepStateManagement";
import { StepApiLayer } from "@/components/wizard/steps/StepApiLayer";
import { StepAuth } from "@/components/wizard/steps/StepAuth";
import { StepDatabase } from "@/components/wizard/steps/StepDatabase";
import { StepTesting } from "@/components/wizard/steps/StepTesting";
import { StepExtras } from "@/components/wizard/steps/StepExtras";
import { StepSummary } from "@/components/wizard/steps/StepSummary";
import { PreviewPanel } from "@/components/preview/PreviewPanel";

const STEPS = [
  StepTemplate,
  StepGeneral,
  StepArchitecture,
  StepStyling,
  StepStateManagement,
  StepApiLayer,
  StepAuth,
  StepDatabase,
  StepTesting,
  StepExtras,
  StepSummary,
];

export default function Home() {
  const { step } = useGeneratorStore();
  const { count, refetch } = useGenerationCount();
  const StepComponent = STEPS[step];

  useEffect(() => {
    const handleGenerationSuccess = () => {
      refetch();
    };
    window.addEventListener("generation-success", handleGenerationSuccess);
    return () => {
      window.removeEventListener("generation-success", handleGenerationSuccess);
    };
  }, [refetch]);

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col selection:bg-white selection:text-black">
      {/* Top bar (Vercel Style) */}
      <header className="border-border bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-4 px-4 md:px-6">
          <div className="flex items-center gap-2">
            <svg
              aria-label="Vercel Logo"
              className="text-foreground"
              viewBox="0 0 76 65"
              height="22"
              width="22"
              fill="currentColor"
            >
              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
            </svg>
            <span className="text-sm font-medium">Next.js Starter</span>
          </div>
          <span className="bg-secondary text-secondary-foreground border-border ml-1 rounded-full border px-2 py-0.5 text-xs font-medium">
            Beta
          </span>
          <div className="text-muted-foreground ml-auto flex items-center gap-4 text-sm font-medium">
            <a
              href="https://vercel.com/docs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Docs
            </a>
            <a
              href="https://vercel.com/templates"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Templates
            </a>
            <a
              href="https://github.com/MrSluffy/starter-nextjs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <GenerationCounter count={count} />
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="mx-auto flex w-full max-w-screen-2xl flex-1 gap-6 px-4 py-8 md:px-6 lg:flex-row">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <WizardSidebar />
        </aside>

        {/* Step panel */}
        <main className="min-w-0 flex-1">
          <div className="border-border bg-card relative h-full overflow-hidden rounded-xl border p-6 shadow-sm">
            <div className="via-foreground/10 absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent"></div>
            <StepComponent />
          </div>
        </main>

        {/* Preview panel */}
        <aside className="hidden shrink-0 xl:block xl:w-96">
          <PreviewPanel />
        </aside>
      </div>
    </div>
  );
}
