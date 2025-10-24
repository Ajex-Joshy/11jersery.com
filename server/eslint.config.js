// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import prettierConfig from "eslint-config-prettier";

export default [
  {
    files: ["**/*.{js,mjs,cjs}"],

    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",

      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },

    ...js.configs.recommended,

    ...prettierConfig,

    rules: {
      "no-console": "warn",

      // Allow unused vars if they start with an underscore
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
];
