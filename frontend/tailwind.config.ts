import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx,html}"],
  theme: {
    colors: {
      orange: {
        DEFAULT: "#ffa500",
        light: "#FFCEB6",
        lightest: "#FFF1EB",
      },

      green: {
        dark: "#119548",
        DEFAULT: "#5AB911",
        light: "#c6fbd3",
      },

      yellow: {
        dark: "#8A710C",
        DEFAULT: "#F8CC16",
        light: "#FFF8CA",
      },

      red: {
        dark: "#771505",
        DEFAULT: "#d33221",
        light: "#FF6B6B",
        lighter: "#FFA399",
        lightest: "#FFDFDF",
      },

      primary: {
        900: "#E16F39",
        800: "#E78C61",
        DEFAULT: "#E78C61",
        700: "#ECA380",
      },

      secondary: {
        900: "#001733",
        800: "#002F66",
        700: "#004899",
        600: "#0061CC",
        DEFAULT: "#0061CC",
        500: "#007AFF",
        400: "#3B98FF",
        300: "#75B6FF",
        200: "#B0D5FF",
        100: "#EBF4FF",
      },

      accent: "#5F5AC6",

      grey: {
        900: "#212529",
        800: "#343A40",
        700: "#495057",
        600: "#6C757D",
        DEFAULT: "#6C757D",
        500: "#ADB5BD",
        400: "#CED4DA",
        300: "#DEE2E6",
        200: "#E9ECEF",
        100: "#F8F9FA",
      },

      white: "#FFFFFF",
      black: "#000000",
    },
    fontFamily: {
      sans: ["var(--font-sans)", "sans-serif"],
      serif: ["var(--font-serif)", "serif"],
    },
    extend: {
      fontSize: {
        xs: ["var(--font-size-xs)", { lineHeight: "1rem" }],
        sm: ["var(--font-size-sm)", { lineHeight: "1.25rem" }],
        base: ["var(--font-size-base)", { lineHeight: "1.5rem" }],
        lg: ["var(--font-size-lg)", { lineHeight: "1.75rem" }],
        xl: ["var(--font-size-xl)", { lineHeight: "1.75rem" }],
        "2xl": ["var(--font-size-2xl)", { lineHeight: "2rem" }],
        "3xl": ["var(--font-size-3xl)", { lineHeight: "2.25rem" }],
        "4xl": ["var(--font-size-4xl)", { lineHeight: "2.5rem" }],
      },
      spacing: {
        "8xl": "96rem",
        "9xl": "128rem",
      },
      borderRadius: {
        "4xl": "2rem",
        md: "0.75rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
