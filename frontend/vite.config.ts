import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: "/",
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  build: {
    manifest: true,
  },
  server: {
    origin: "http://localhost:80", // Match your Nginx port
  },
});
