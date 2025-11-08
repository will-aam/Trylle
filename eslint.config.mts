import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // Ignora pastas que não precisam ser analisadas
  {
    ignores: ["node_modules", ".next", "dist", "build"],
  },

  // Configuração base para JS e TS
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      pluginReact.configs.flat.recommended,
    ],
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      /* 🧩 Regras TypeScript ajustadas */
      "@typescript-eslint/no-explicit-any": "off", // permite usar any quando necessário
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-unused-expressions": "warn",

      /* ⚛️ Regras React / Next */
      "react/react-in-jsx-scope": "off", // não precisa importar React no Next.js
      "react/jsx-uses-react": "off",
      "react/prop-types": "off",

      /* 🧼 Outras regras de boas práticas */
      "no-empty": "warn",
      "no-useless-escape": "warn",

      /* 🔒 Sua regra personalizada para o sonner */
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "sonner",
              message:
                "Import toast from '@/src/lib/safe-toast' instead of importing directly from 'sonner'.",
            },
          ],
        },
      ],
    },
  },
]);
