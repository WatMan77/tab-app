import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import tsParser from "@typescript-eslint/parser";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ["dist/**"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js, react: pluginReact },
    extends: ["js/recommended"],
    languageOptions: {
      globals: globals.browser,
      parser: tsParser,
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: __dirname
      }
    },
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat["recommended"],
  {
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      'react/prop-types': 'off'
    }
  }
]);
