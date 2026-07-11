/**
 * Tailwind configuration entrypoint.
 *
 * Purpose:
 * - Define design-token mappings and theme extensions.
 * - Configure content scan paths for frontend source files.
 *
 * Intended behavior:
 * - Keep utility class generation aligned with UCF Prediction Market design tokens.
 *
 * Token values come from DESIGN.md section 13 — components must use these
 * classes instead of hardcoded hex values.
 */
module.exports = {
  content: ["./src/**/*.{ts,tsx}", "./index.html"],
  theme: {
    extend: {
      colors: {
        ink: "#14161B",
        surface: "#F7F8FA",
        card: "#FFFFFF",
        gold: "#FFC904",
        "gold-ink": "#8A6B00",
        yes: "#12805C",
        no: "#C6432E",
        muted: "#6B7280",
        line: "#E2E5EA",
        deck: "#1B1E26",
      },
      fontFamily: {
        display: ['"Space Grotesk"', "sans-serif"],
        body: ["Inter", "sans-serif"],
        data: ['"JetBrains Mono"', "monospace"],
      },
      borderRadius: {
        card: "12px",
        btn: "8px",
      },
    },
  },
  plugins: [],
};
