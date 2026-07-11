import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  // Tailwind v4 runs through this Vite plugin (no tailwind.config / PostCSS);
  // tokens live in src/index.css under @theme.
  plugins: [react(), tailwindcss()],
  // Load VITE_* from repo-root .env (shared with backend).
  envDir: "..",
  server: {
    port: 5173,
    // Fail loudly if 5173 is taken — Google OAuth origins are registered for
    // http://localhost:5173; silently switching ports breaks GIS sign-in.
    strictPort: true,
  },
});
