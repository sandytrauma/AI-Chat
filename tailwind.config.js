// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        customGray: '#f5f5f5',
        customBlue: '#007bff',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
