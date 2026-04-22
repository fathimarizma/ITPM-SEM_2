/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1d4ed8', // Custom blue
        secondary: '#64748b',
        background: '#f8fafc',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '0% center' },
          '50%': { backgroundPosition: '100% center' },
          '100%': { backgroundPosition: '0% center' },
        },
      },
      animation: {
        shimmer: 'shimmer 3s linear infinite',
      },
      backgroundImage: {
        'grid-white': "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.05)'%3e%3cpath d='m0 .5h32m-32 32v-32'/%3e%3c/svg%3e\")",
        'grid-blue': "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(59 130 246 / 0.05)'%3e%3cpath d='m0 .5h32m-32 32v-32'/%3e%3c/svg%3e\")",
      },
    },
  },
  plugins: [],
}
