/** @type {import('tailwindcss').Config} */
import safeArea from "tailwindcss-safe-area";
import { postcss } from "autoprefixer";
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      height: {
        "dynamic-screen": "100dvh",
      },
      minHeight: {
        "dynamic-screen": "100dvh",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [safeArea(), postcss()],
  darkMode: false,
};
