import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0A0E1A",
        surface: "#111827",
        border: "#1F2937",
        accent: "#6366F1",
        "risk-high": "#EF4444",
        "risk-medium": "#F59E0B",
        "risk-low": "#10B981",
        "text-primary": "#F9FAFB",
        "text-secondary": "#9CA3AF",
      },
    },
  },
  plugins: [],
};
export default config;
