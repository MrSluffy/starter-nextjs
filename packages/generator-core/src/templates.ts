type TemplatePreset = {
  router?: "app" | "pages";
  styling?: "tailwind" | "css-modules" | "styled-components" | "sass" | "none";
  stateManagement?: "zustand" | "redux-toolkit" | "react-context" | "none";
  apiLayer?: "rest" | "graphql" | "none";
  auth?: "nextauth" | "jwt" | "none";
  database?: "postgresql" | "mongodb" | "none";
  orm?: "prisma" | "drizzle" | "none";
  testing?: "jest" | "vitest" | "playwright" | "cypress" | "none";
  extras?: {
    docker?: boolean;
    githubActions?: boolean;
    openApiClient?: boolean;
    eslintPrettier?: boolean;
    huskyLintStaged?: boolean;
  };
};

export type TemplateDefinition = {
  id: string;
  label: string;
  description: string;
  badge: string;
  icon: string;
  highlights: string[];
  preset: TemplatePreset;
};

export const DEFAULT_TEMPLATE_ID = "custom";

export const TEMPLATES = [
  {
    id: "custom",
    label: "Custom",
    description: "Start from a blank starter and configure every part yourself.",
    badge: "Default",
    icon: "🧱",
    highlights: ["Balanced defaults", "Fully customizable", "Best for experimentation"],
    preset: {},
  },
  {
    id: "saas",
    label: "SaaS Starter",
    description: "A practical authenticated app stack for products with accounts, data, and CI.",
    badge: "Popular",
    icon: "🚀",
    highlights: ["NextAuth + Prisma", "PostgreSQL-ready", "GitHub Actions included"],
    preset: {
      router: "app",
      styling: "tailwind",
      stateManagement: "zustand",
      apiLayer: "rest",
      auth: "nextauth",
      database: "postgresql",
      orm: "prisma",
      testing: "vitest",
      extras: {
        githubActions: true,
        eslintPrettier: true,
      },
    },
  },
  {
    id: "dashboard",
    label: "Dashboard",
    description:
      "A stronger app baseline for internal tools and admin surfaces with state and e2e testing.",
    badge: "Teams",
    icon: "📊",
    highlights: ["Redux Toolkit", "Prisma + Postgres", "Playwright + Docker"],
    preset: {
      router: "app",
      styling: "tailwind",
      stateManagement: "redux-toolkit",
      apiLayer: "rest",
      auth: "nextauth",
      database: "postgresql",
      orm: "prisma",
      testing: "playwright",
      extras: {
        docker: true,
        githubActions: true,
        eslintPrettier: true,
      },
    },
  },
  {
    id: "content",
    label: "Content Site",
    description:
      "A lean preset for blogs, docs, and marketing pages that do not need app infrastructure.",
    badge: "Lean",
    icon: "📝",
    highlights: ["Minimal dependencies", "App Router + Tailwind", "No auth or database"],
    preset: {
      router: "app",
      styling: "tailwind",
      stateManagement: "none",
      apiLayer: "none",
      auth: "none",
      database: "none",
      orm: "none",
      testing: "none",
      extras: {
        eslintPrettier: true,
      },
    },
  },
] as const satisfies readonly TemplateDefinition[];

export type TemplateId = (typeof TEMPLATES)[number]["id"];

export function getTemplateById(templateId: TemplateId): TemplateDefinition {
  return (TEMPLATES.find((template) => template.id === templateId) ??
    TEMPLATES[0]) as TemplateDefinition;
}
