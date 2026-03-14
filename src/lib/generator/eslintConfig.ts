import type { GeneratorConfig } from "@/store/generatorStore";

export function buildEslintConfig(cfg: GeneratorConfig): object {
  return {
    extends: ["next/core-web-vitals", ...(cfg.extras.eslintPrettier ? ["prettier"] : [])],
    rules: {
      "@next/next/no-html-link-for-pages": "error",
      "react/no-unescaped-entities": "off",
    },
  };
}

export function buildPrettierConfig(): object {
  return {
    semi: true,
    trailingComma: "all",
    singleQuote: false,
    printWidth: 100,
    tabWidth: 2,
    useTabs: false,
    plugins: [],
  };
}

export function buildLintStagedConfig(cfg: GeneratorConfig): object {
  const ext = cfg.language === "typescript" ? "ts,tsx" : "js,jsx";
  return {
    [`*.{${ext}}`]: ["eslint --fix", "prettier --write"],
    "*.{css,md,json}": ["prettier --write"],
  };
}
