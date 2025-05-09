/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",

  ],
  theme: {
    extend: {
      colors: {
        surface: "#1a1a1a",
        accent: "#4ec3ff",
        ledGreen: "#90ff5c",
        ledRed: "#ff6060",
      },
    },
  },
  plugins: [],
};
