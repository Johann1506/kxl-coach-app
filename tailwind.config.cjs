/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        kxl: {
          green: "#1BBF83",
          dark: "#0A2A22"
        }
      }
    },
  },
  plugins: [],
};
