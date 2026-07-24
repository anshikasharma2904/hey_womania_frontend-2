import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        ivory: "var(--ivory)",
        sandstone: "var(--sandstone)",
        almond: "var(--almond)",
        gold: "var(--gold)",
        mocha: "var(--mocha)"
      },
      boxShadow: {
        luxe: "0 30px 80px rgba(76, 56, 38, 0.18)",
        card: "0 20px 60px rgba(103, 79, 51, 0.16)"
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top left, rgba(255,246,231,0.95), transparent 38%), radial-gradient(circle at 80% 10%, rgba(198,157,93,0.16), transparent 28%), linear-gradient(135deg, rgba(246,236,221,0.95), rgba(230,216,197,0.88) 35%, rgba(216,194,165,0.82) 100%)"
      }
    }
  },
  plugins: []
};

export default config;
