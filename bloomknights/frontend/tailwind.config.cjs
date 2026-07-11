/**
 * Tailwind configuration entrypoint.
 *
 * Purpose:
 * - Define design-token mappings and theme extensions.
 * - Configure content scan paths for frontend source files.
 *
 * Intended behavior:
 * - Keep utility class generation aligned with Bloomknights design tokens.
 */
module.exports = {
  content: ["./src/**/*.{ts,tsx}", "./index.html"],
  theme: {
    extend: {},
  },
  plugins: [],
};

