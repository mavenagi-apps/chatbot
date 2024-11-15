import * as fs from "fs";
import * as path from "path";

import preact from "@preact/preset-vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    {
      name: "generate-redirects",
      writeBundle(_, bundle) {
        const entryChunk = Object.values(bundle).find(
          (file) => file.type === "chunk" && file.isEntry,
        );
        console.assert(entryChunk, "No entry point found");
        fs.writeFileSync(
          path.resolve(__dirname, "..", "vercel.json"),
          JSON.stringify({
            redirects: [
              {
                source: "/widget.js",
                destination: `/${entryChunk?.fileName}`,
                permanent: false,
              },
            ],
          }),
        );
      },
    },
    preact(),
  ],
  build: {
    rollupOptions: {
      input: {
        widget: "src/main.tsx",
      },
      output: {
        format: "umd",
        dir: "../public",
        entryFileNames: "[name]-[hash].js",
        chunkFileNames: "[name]-[hash].js",
        assetFileNames: "[name]-[hash].[ext]",
      },
    },
  },
});
