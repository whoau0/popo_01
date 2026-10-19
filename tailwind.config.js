/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pinterest Fresh Food / Personalized Meals Palette
        cream: {
          DEFAULT: "#fbf8ee", // Warm buttermilk cream ground
          paper: "#ffffff",
          soft: "#f4f0de",
          muted: "#ece5cf",
          border: "#e2dac2",
        },
        forest: {
          DEFAULT: "#0c3b28", // Signature deep pine green
          dark: "#072619",
          deep: "#0f4430",
          light: "#175b42",
          surface: "#092e1f",
          subtle: "#e7f3ee",
        },
        lime: {
          DEFAULT: "#d6fa3b", // Electric chartreuse/lime
          hover: "#c3e824",
          dark: "#9fc513",
          light: "#ecfc85",
          soft: "#f6fed7",
        },
        coral: {
          DEFAULT: "#ff5733", // Tangerine / coral script accent
          hover: "#e44320",
          soft: "#fff0eb",
        },
        sage: {
          DEFAULT: "#4a6356",
          light: "#7b998a",
          muted: "#8c9f95",
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        script: ['Caveat', 'Nanum Pen Script', 'cursive', 'sans-serif'],
      },
      boxShadow: {
        'solid-sm': '2px 2px 0px #0c3b28',
        'solid': '3px 3px 0px #0c3b28',
        'solid-lg': '5px 5px 0px #0c3b28',
        'solid-lime': '3px 3px 0px #d6fa3b',
      }
    },
  },
  plugins: [],
}
