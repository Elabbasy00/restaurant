import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
export default defineConfig({
  base: "/",
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  build: {
    manifest: true,
    rollupOptions: {
      preserveEntrySignatures: "strict",
    },
  },
  server: {
    origin: "http://localhost", // Match your Nginx port
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "app/"),
    },
  },
});
