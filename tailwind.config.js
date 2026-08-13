/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0B0D11",
          900: "#12151B",
          800: "#181C24",
          700: "#232833",
          600: "#2E3542",
        },
        mist: {
          400: "#6B7280",
          300: "#9AA1AC",
          200: "#C4C9D1",
          100: "#EDEEF0",
        },
        signal: {
          DEFAULT: "#5EEAD4",
          dim: "#2DD4BF",
        },
        amber: {
          DEFAULT: "#F5A623",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        xl: "14px",
      },
    },
  },
  plugins: [],
};
