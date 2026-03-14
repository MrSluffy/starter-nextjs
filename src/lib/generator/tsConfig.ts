import type { GeneratorConfig } from "@/store/generatorStore";

export function buildTsConfig(): object {
  return {
    compilerOptions: {
      target: "ES2017",
      lib: ["dom", "dom.iterable", "esnext"],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: "esnext",
      moduleResolution: "bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: "preserve",
      incremental: true,
      plugins: [{ name: "next" }],
      paths: {
        "@/*": ["./src/*"],
      },
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    exclude: ["node_modules"],
  };
}

export function buildNextConfig(cfg: GeneratorConfig): string {
  const nextMajor = Number.parseInt(cfg.nextVersion, 10);
  const isTS = cfg.language === "typescript";
  const lines: string[] = [];
  if (isTS) {
    lines.push(`import type { NextConfig } from "next";`);
    lines.push("");
    lines.push("const nextConfig: NextConfig = {");
  } else {
    lines.push('/** @type {import("next").NextConfig} */');
    lines.push("const nextConfig = {");
  }
  if (cfg.language === "typescript") lines.push("  typescript: { ignoreBuildErrors: false },");
  if (!Number.isNaN(nextMajor) && nextMajor >= 15) {
    lines.push("  reactCompiler: false,");
  }
  lines.push("};");
  lines.push("");
  lines.push("export default nextConfig;");
  return lines.join("\n");
}
