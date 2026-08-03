import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  globalIgnores(["dist/**"]),
]);

export default eslintConfig;
