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
  const lines: string[] = [];
  lines.push(`import type { NextConfig } from "next";`);
  lines.push("");
  lines.push("const nextConfig: NextConfig = {");
  if (cfg.extras.eslintPrettier) lines.push("  eslint: { ignoreDuringBuilds: false },");
  if (cfg.language === "typescript") lines.push("  typescript: { ignoreBuildErrors: false },");
  lines.push("  experimental: {");
  lines.push("    // Enable React Compiler for automatic memoization");
  lines.push("    reactCompiler: false,");
  lines.push("  },");
  lines.push("};");
  lines.push("");
  lines.push("export default nextConfig;");
  return lines.join("\n");
}
