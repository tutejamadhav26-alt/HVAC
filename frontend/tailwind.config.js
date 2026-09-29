/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0f172a",
        cardBg: "#1e293b",
        borderBg: "#334155",
        brandBlue: "#3b82f6",
        brandGreen: "#10b981",
        brandYellow: "#f59e0b",
        brandRed: "#ef4444"
      }
    },
  },
  plugins: [],
}
