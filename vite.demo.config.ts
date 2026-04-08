import { defineConfig } from "vite";

export default defineConfig({
  // Set root to the demo directory
  root: "./examples/basic",

  // Public directory for static assets
  publicDir: "./examples/public",

  // Build configuration
  build: {
    outDir: "./dist-demo",
    emptyOutDir: true,
    sourcemap: true,
  },

  // Server configuration
  server: {
    port: 5173,
    open: true,
  },

  // Resolve configuration to handle imports from src directory
  resolve: {
    alias: {
      // Allow importing from the library source
      "@gall3ry": "./src/index.ts",
    },
  },

  // CSS configuration
  css: {
    modules: {
      localsConvention: "camelCase",
    },
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ["gsap"],
  },
});
