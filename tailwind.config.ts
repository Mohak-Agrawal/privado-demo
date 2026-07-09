import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "DM Sans", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        bg: "#0A0A0F",
        surface: "#111118",
        raised: "#1A1A24",
        "border-color": "#1E1E2E",
        // Privado green
        accent: "#4ADE80",
        "accent-dim": "#22C55E",
        // Privado purple
        purple: "#A855F7",
        // Risk
        "risk-high": "#EF4444",
        "risk-medium": "#F59E0B",
        "risk-low": "#4ADE80",
        // Text
        "text-primary": "#F8FAFC",
        "text-muted": "#94A3B8",
        "text-dim": "#475569",
      },
      boxShadow: {
        "glow-green": "0 0 24px rgba(74,222,128,0.12), 0 0 48px rgba(74,222,128,0.04)",
        "glow-purple": "0 0 24px rgba(168,85,247,0.12)",
        "card": "0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.4)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.6)",
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "fade-in": "fadeIn 0.25s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      backgroundImage: {
        "gradient-privado": "linear-gradient(135deg, #A855F7 0%, #6366F1 50%, #4ADE80 100%)",
        "gradient-cta": "linear-gradient(135deg, #C084FC 0%, #818CF8 40%, #4ADE80 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
