/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0f2340',
          800: '#1e3a5f',
          700: '#2a4f80',
          600: '#2563eb',
        },
      },
    },
  },
  plugins: [],
};
