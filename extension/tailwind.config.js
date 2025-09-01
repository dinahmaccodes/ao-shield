/** @type {import('tailwindcss').Config} */
export default {
  content: ["./popup.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        background: "#0A0A0A",
        "background-secondary": "#1A1A1A",
        text: "#FFFFFF",
        "text-secondary": "#A0A0A0",
        accent: "#0FF0FC",
        "accent-hover": "#0DE8DB",
        success: "#00D4AA",
        warning: "#FFB800",
        danger: "#FF3B30",
        "card-bg": "#111111",
        "border-primary": "rgba(255, 255, 255, 0.1)",
        "border-secondary": "rgba(255, 255, 255, 0.05)",
      },
      boxShadow: {
        glow: "0 0 20px rgba(15, 240, 252, 0.3)",
        "glow-strong": "0 0 30px rgba(15, 240, 252, 0.5)",
      },
    },
  },
  plugins: [],
};
