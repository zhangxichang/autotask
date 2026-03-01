import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from "@vue/eslint-config-typescript";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default defineConfigWithVueTs({
  files: ["src/**/*.{ts,tsx,vue}"],
  extends: [
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    vueTsConfigs.recommended,
  ],
  languageOptions: { parserOptions: { projectService: true } },
  rules: {
    "@typescript-eslint/strict-boolean-expressions": "error",
    "@typescript-eslint/no-misused-promises": "off",
    "no-unassigned-vars": "off",
  },
});
