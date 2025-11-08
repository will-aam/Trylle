// eslint.config.mts
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import nextPlugin from "@next/eslint-plugin-next"; // <-- 1. IMPORTAR O PLUGIN DO NEXT
import { defineConfig } from "eslint/config";

export default defineConfig([
  // Ignora pastas que não precisam ser analisadas
  {
    ignores: ["node_modules", ".next", "dist", "build", ".vercel"],
  },

  // Configuração base para JS e TS
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    // 2. ADICIONAR PLUGINS DO NEXT NO EXTENDS
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      pluginReact.configs.flat.recommended,
      nextPlugin.configs.recommended, // <-- Adicionado
      nextPlugin.configs["core-web-vitals"], // <-- Adicionado
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

  // --- 3. ADICIONAR EXCEÇÕES PARA CORRIGIR O BUILD ---

  // Permite 'sonner' APENAS nos arquivos que precisam dele
  {
    files: ["src/lib/safe-toast.ts", "src/components/ui/sonner.tsx"],
    rules: {
      "no-restricted-imports": "off",
    },
  },

  // Desliga a regra 'no-unknown-property' APENAS para o command.tsx
  {
    files: ["src/components/ui/command.tsx"],
    rules: {
      "react/no-unknown-property": "off",
    },
  },
]);
