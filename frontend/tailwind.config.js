/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          black: "#050505",
          dark: "#0a0a0c",
          blue: "#0f172a",
          neon: "#39ff14",
          "neon-blue": "#00f3ff",
          "neon-purple": "#bc13fe",
          "neon-red": "#ff003c",
        }
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          'from': { 'box-shadow': '0 0 5px #39ff14, 0 0 10px #39ff14' },
          'to': { 'box-shadow': '0 0 10px #39ff14, 0 0 20px #39ff14' },
        }
      }
    },
  },
  plugins: [],
}
