/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dogkas: {
          primary: '#FF8A3D',
          'primary-light': '#FFB380',
          'primary-dark': '#E67326',
          blocked: '#FF6B6B',
          'blocked-light': '#FFA8A8',
          available: '#FFFFFF',
          'available-hover': '#F8F9FA',
          accent: '#FFC93D',
          'accent-light': '#FFE08A',
        },
      },
    },
  },
  plugins: [],
};
