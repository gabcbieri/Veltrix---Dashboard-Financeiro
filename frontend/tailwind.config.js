/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        paper: "#eff2f0",
        earth: {
          100: "#f8faf9",
          200: "#e3e9e5",
          300: "#c8d2cb",
          500: "#9ca7a1",
          600: "#6f7c76",
          700: "#43534b",
          800: "#2a3932",
          900: "#15231c"
        },
        wine: {
          50: "#ffffff",
          100: "#f7faf8",
          200: "#edf2ef",
          300: "#dde5e0"
        },
        copper: {
          200: "#8dd4ab",
          300: "#49b078",
          400: "#1f8d57"
        },
        night: "#0b0d12",
        carbon: "#121622",
        neon: "#ff3b9a",
        aqua: "#2bffb0",
        electric: "#4a7cff",
        steel: "#1a1f2e"
      },
      borderRadius: {
        xl: "20px",
        '2xl': "28px"
      },
      boxShadow: {
        glow: "0 20px 60px rgba(0,0,0,0.55)",
        soft: "0 8px 30px rgba(0,0,0,0.35)"
      }
    },
  },
  plugins: [],
}
