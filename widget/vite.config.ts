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
          path.resolve(__dirname, "..", "next.config.ts"),
          `import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async redirects() {
    return [
      {
        source: "/widget.js",
        destination: "/${entryChunk?.fileName}",
        permanent: false,
      },
    ];
  }
};

export default withNextIntl(nextConfig);
`,
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
