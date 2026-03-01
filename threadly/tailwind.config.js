/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        terracotta: {
          DEFAULT: "#C9622F",
          light:   "#E8825A",
          pale:    "#F5E6DF",
          dark:    "#A04A20",
        },
        cream: "#FAF7F4",
        stone: {
          50:  "#F5F1ED",
          100: "#EDE8E2",
          200: "#D9D1C7",
          300: "#BFB5A8",
          500: "#8C7F72",
          700: "#4A4037",
          900: "#1C1714",
        },
      },
      fontFamily: {
        serif: ["DM Serif Display", "Georgia", "serif"],
        sans:  ["DM Sans", "sans-serif"],
      },
      borderRadius: {
        xl:   "12px",
        "2xl":"20px",
        "3xl":"28px",
      },
    },
  },
  plugins: [],
};