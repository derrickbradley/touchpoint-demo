// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-5': 'var(--primary-5)',
        'primary-10': 'var(--primary-10)',
        'primary-40': 'var(--primary-40)',
        'primary-60': 'var(--primary-60)',
        'primary-80': 'var(--primary-80)',
        'error-primary': 'var(--error-primary)',
        'success-primary': 'var(--success-primary)',
        'accent': 'var(--accent)',
      },
    },
  },
  plugins: [],
}