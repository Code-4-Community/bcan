import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    colors: {
      'dark-blue': '#3191CF',
      'light-blue': '#90c4e5',
      'green': '#119548',
      'yellow': '#F8CC16',
      'tan': '#F2EBE4',
      'dark-orange': "#F26624",
      'light-orange': "#f7a781",
      'medium-orange': '#F58D5C',
      'white': "#FFFFFF",
      'light-gray': '#F8F8F8',
      'pale-orange':'#FFCEB6',
      'white-orange': '#FFF1EB',
    },
    fontFamily: {
      sans: ['Montserrat', 'sans-serif'],
      serif: ['Georgia', 'serif'],
    },
    extend: {
      spacing: {
        '8xl': '96rem',
        '9xl': '128rem',
      },
      borderRadius: {
        '4xl': '2rem',
        'md': '15px',
      },
    }
  },
  plugins: [],
} satisfies Config;
