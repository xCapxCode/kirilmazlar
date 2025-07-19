/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: '#FFFFFF',
        surface: 'var(--color-surface, #FFFFFF)',
      }
    },
  },
  plugins: [
    function ({ addVariant }) {
      addVariant('autofill', '&:-webkit-autofill');
    },
  ],
}
