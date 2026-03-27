// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  // base: "",                        // works with file://
  plugins: [react({
    babel: { plugins: ["@emotion"] }, // enables auto labels in dev
  }),],
  resolve: {
    alias: {
      "@src": path.resolve(__dirname, "src"),
      "@lib": path.resolve(__dirname, "lib")
    },
  },
  define: {
    // "process.env.NODE_ENV": JSON.stringify("production"),
    "process.env": {},             // avoid 'process is not defined'
    global: "globalThis"
  },
  esbuild: { keepNames: true },
  build: {
    lib: {
      entry: "src/entry.tsx",
      name: "YayinApp",
      formats: ["iife"],
      fileName: () => "yayin-app.iife.js",
    },
    emptyOutDir: false,   // <— prevents wiping dist before build
    target: "es2017",
    cssCodeSplit: false,           // one CSS file
    assetsInlineLimit: 0,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,   // no vendor chunks
        inlineDynamicImports: true,
        assetFileNames: (asset) =>
          asset.name?.endsWith(".css") ? "style.css" : "[name][extname]",
      },
      // external: ["react", "react-dom"], // (only if you want to exclude them)
      // output: { globals: { react: "React", "react-dom": "ReactDOM" } },
    },
  },
});
