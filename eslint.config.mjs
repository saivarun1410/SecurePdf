import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["app/**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.flat.recommended.rules,
      "no-undef": "off",
    },
  },
  {
    files: [
      "app/features/workspace/components/DocumentCard.tsx",
      "app/features/workspace/components/DocumentEndDropZone.tsx",
      "app/features/workspace/components/PageCard.tsx",
    ],
    rules: {
      // dnd-kit exposes callback refs and reactive getters as hook return values.
      "react-hooks/refs": "off",
    },
  },
  globalIgnores([
    ".next/**",
    ".vinext/**",
    ".wrangler/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
