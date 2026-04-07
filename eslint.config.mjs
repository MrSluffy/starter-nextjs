import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { dependencies } = require("./package.json");

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  eslintConfigPrettier,
  {
    settings: {
      // Explicitly set the React version to avoid eslint-plugin-react calling
      // the removed context.getFilename() API when auto-detecting React version.
      react: {
        version: dependencies.react,
      },
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
  ]),
]);

export default eslintConfig;
