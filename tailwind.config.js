/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: {
          50: "#f6f7f8",
          100: "#eef1f3",
          200: "#d6dde2"
        },
        brand: {
          50: "#fff8fa",
          100: "#fff0f5",
          200: "#ffe2ec",
          500: "#e98fad",
          600: "#d87496",
          700: "#ba597e"
        },
        ink: {
          700: "#334155",
          800: "#1f2937",
          900: "#111827"
        }
      },
      boxShadow: {
        card: "0 22px 60px -32px rgba(15, 23, 42, 0.28)",
        surface: "0 16px 36px -24px rgba(15, 23, 42, 0.3)"
      },
      keyframes: {
        "fade-in-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(16px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        "soft-pop": {
          "0%": {
            opacity: "0",
            transform: "scale(0.98)"
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)"
          }
        }
      },
      animation: {
        "fade-in-up": "fade-in-up 0.45s ease-out both",
        "soft-pop": "soft-pop 0.32s ease-out both"
      }
    }
  },
  plugins: []
};
