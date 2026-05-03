import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Landing page accent system
        "accent-blue": "#2563EB",
        "accent-orange": "#F97316",
        "accent-glow": "rgba(37,99,235,0.35)",
        "landing-primary": "#060A12",
        "landing-secondary": "#0D1525",
        "landing-card": "#111827",
        // App-wide tokens — driven by CSS custom properties for theming
        primary: "var(--app-primary)",
        "primary-dark": "var(--app-primary-dark)",
        "primary-light": "var(--app-primary-light)",
        accent: "var(--app-primary)",
        "accent-light": "var(--app-primary-light)",
        background: "var(--app-background)",
        surface: "var(--app-surface)",
        border: "var(--app-border)",
        "border-strong": "var(--app-border-strong)",
        "text-primary": "var(--app-text-primary)",
        "text-secondary": "var(--app-text-secondary)",
        "text-muted": "var(--app-text-muted)",
        success: "var(--app-success)",
        warning: "var(--app-warning)",
        error: "var(--app-error)",
      },
      fontFamily: {
        syne: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-inter)", "sans-serif"],
        sans: ["var(--font-dm-sans)", "var(--font-inter)", "sans-serif"],
        body: ["var(--font-dm-sans)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 16px var(--app-glow)",
        "glow-blue": "0 0 32px rgba(37, 99, 235, 0.35)",
        "glow-orange": "0 0 24px rgba(249, 115, 22, 0.3)",
        surface: "0 4px 16px rgba(0, 0, 0, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
