import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  eslintConfigPrettier,
  {
    settings: {
      react: {
        version: "19",
      },
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "coverage/**"]),
]);

export default eslintConfig;
