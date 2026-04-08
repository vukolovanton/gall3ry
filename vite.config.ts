import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "./src/index.ts",
      name: "InfiniteGallery",
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
      formats: ["es", "cjs"],
    },
    emptyOutDir: false,
    rollupOptions: {
      // Externalize GSAP so it's not bundled - users will need to install it separately
      external: ["gsap"],
      output: {
        // Provide global variable names for externalized dependencies (for UMD builds)
        globals: {
          gsap: "gsap",
        },
        // Ensure clean exports
        exports: "named",
      },
    },
    // Generate source maps for debugging
    sourcemap: true,
    // Minify output (using Vite's default terser)
    // Report compressed sizes
    reportCompressedSize: true,
  },
  // TypeScript compilation for type declarations
  plugins: [],
});
