/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/apps/admin/seller/pages/settings/index.jsx", // Renk değişikliği için eklendi
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
