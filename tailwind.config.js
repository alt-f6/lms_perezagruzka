module.exports = {
  content: [
    "./views/**/*.ejs",
    "./src/**/*.js",
    "./public/**/*.{js,css}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography")],
};
