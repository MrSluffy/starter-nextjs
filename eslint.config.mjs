import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "apps/*/dist/**",
    "packages/*/dist/**",
  ]),
]);

export default eslintConfig;
