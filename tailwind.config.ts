import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-primary)",
        foreground: "var(--text-primary)",
        "bg-primary": "var(--bg-primary)",
        "bg-secondary": "var(--bg-secondary)",
        "bg-card": "var(--bg-card)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "accent-green": "var(--accent-green)",
        "accent-red": "var(--accent-red)",
        "border-color": "var(--border-color)",
      },
      fontFamily: {
        gilroy: ["var(--font-gilroy)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-source-code)", "monospace"],
      },
      maxWidth: {
        "content": "1200px",
      },
    },
  },
  plugins: [],
};

export default config;

