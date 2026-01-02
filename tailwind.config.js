/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'thesis-dark': '#f0f2f0',   // Light Gray/White Background
        'thesis-dim': '#e1e6e1',    // Slightly darker gray for panels
        'thesis-light': '#2c4c3b',  // Dark Forest Green (for text/primary)
        'thesis-accent': '#d97706', // Warm Orange/Amber (Literature)
        'thesis-secondary': '#9333ea', // Purple (Experiments)
      }
    },
  },
  plugins: [],
}
