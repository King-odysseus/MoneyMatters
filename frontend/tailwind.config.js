/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
      colors: {
        primary: { DEFAULT: "#0f766e", light: "#14b8a6" },
        danger: "#dc2626",
        success: "#16a34a",
        warning: "#ca8a04",
      },
    },
  },
  plugins: [],
};
