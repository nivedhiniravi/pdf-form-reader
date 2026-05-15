import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // "@/" maps to "src/" — keeps imports clean across all files
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    // pdfjs-dist uses dynamic imports — exclude from Vite pre-bundling
    exclude: ["pdfjs-dist"],
  },
});
