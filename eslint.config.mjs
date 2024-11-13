import path from "node:path";
import { fileURLToPath } from "node:url";

import { includeIgnoreFile } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, ".gitignore");

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const config = [
  includeIgnoreFile(gitignorePath),
  {
    ignores: ["src/app/mavenagi-cgi/"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    plugins: { "@tanstack/query": {} },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
];

export default config;
