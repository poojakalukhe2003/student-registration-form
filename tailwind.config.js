module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        amber: {
          50: "#fff8ed",
          100: "#fff1db",
          300: "#fdba74",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(-6px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 280ms ease-out both",
      },
    },
  },
  plugins: [],
};