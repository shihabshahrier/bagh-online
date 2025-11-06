/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Manrope", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      colors: {
        "bagh-night": "#050f1a",
        "bagh-deep": "#071d30",
        "bagh-card": "rgba(7,24,43,0.85)",
        "bagh-accent": "#00f5ff",
      },
      backgroundImage: {
        "bagh-nebula":
          "radial-gradient(circle at 20% 20%, rgba(0, 189, 255, 0.25), transparent 40%), radial-gradient(circle at 80% 0%, rgba(159, 28, 255, 0.25), transparent 45%), linear-gradient(160deg, #050f1a 0%, #071d30 35%, #08111e 100%)",
      },
      boxShadow: {
        glow: "0 20px 45px rgba(0, 245, 255, 0.15)",
      },
    },
  },
  plugins: [],
};
