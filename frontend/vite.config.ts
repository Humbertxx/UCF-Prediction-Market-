import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  // Load VITE_* from repo-root .env (shared with backend).
  envDir: "..",
  server: {
    port: 5173,
  },
});
