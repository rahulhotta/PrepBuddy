/// <reference types="vitest/config" />
import mdx from "@mdx-js/rollup";
import rehypeShiki from "@shikijs/rehype";
import react from "@vitejs/plugin-react";
import remarkGfm from "remark-gfm";
import { defineConfig } from "vite";
import { blueprintTheme } from "./scripts/lib/shiki-theme.ts";
import { contentPlugin } from "./scripts/lib/vite-content-plugin.ts";

export default defineConfig({
  plugins: [
    contentPlugin(),
    {
      enforce: "pre",
      ...mdx({
        remarkPlugins: [remarkGfm],
        rehypePlugins: [[rehypeShiki, { theme: blueprintTheme }]],
      }),
    },
    react(),
  ],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    testTimeout: 30_000,
  },
});
