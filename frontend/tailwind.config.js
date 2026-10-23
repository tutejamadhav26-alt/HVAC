/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic Commercial Building Design Tokens
        bems: {
          bg: 'var(--bems-bg)',
          surface: 'var(--bems-surface)',
          surfaceHover: 'var(--bems-surface-hover)',
          border: 'var(--bems-border)',
          text: 'var(--bems-text)',
          muted: 'var(--bems-text-muted)',
          accent: '#3b82f6',
          accentHover: '#2563eb',
          ok: '#22c55e',
          warn: '#f59e0b',
          danger: '#ef4444'
        },
        darkBg: "#0b0f14",
        cardBg: "#121821",
        borderBg: "rgba(255, 255, 255, 0.08)",
      },
      borderRadius: {
        'panel': '14px',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
