/** @type {import('tailwindcss').Config} */

const gray = {
  100: "#EFEFEF",
  200: "#dfdfdf",
  300: "#cfcfcf",
  500: "#8f8f8f",
  700: "#505050",
};

const textColor = {
  default: "#000000",
  secondary: "#707070",
};

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  mode: "jit",
  theme: {
    extend: {
      colors: {
        gray,
      },
      textColor,
    },
  },
  plugins: [],
};
