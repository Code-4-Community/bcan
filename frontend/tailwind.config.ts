import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    colors: {
      'dark-blue': '#3191CF',
      'light-blue': '#90c4e5',
      'green': '#119548',
      'green-2': '#5AB911',
      'pale-green': '#c6fbd3',
      'yellow': '#F8CC16',
      'medium-yellow': '#FFF8CA',
      'dark-yellow': '#8a710c',
      'black': '#000000',
      'red': '#ff0000',
      'light-red': '#FF6B6B',
      'tan': '#F2EBE4',
      'dark-orange': "#F26624",
      'light-orange': "#f7a781",
      'medium-orange': '#F58D5C',
      'white': "#FFFFFF",
      'light-gray': '#F8F8F8',
      'light-gray-2': '#D3D3D3',
      'light-gray-3': '#F5F4F4',
      'gray': '#808080',
      'pale-orange':'#FFCEB6',
      'white-orange': '#FFF1EB',
      'medium-gray': '#D9D9D9',
      'medium-gray-2': '#BFBBBB',
      'dark-gray': '#757575',
      'warning': '#D33221',
      'light-warning': '#FFA399',
      'light-warning-2': '#FFDFDF',
      'off-white': '#F9F9F9',
      'teal': '#213547',
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
        'md': '0.75rem',
      },
    }
  },
  plugins: [],
} satisfies Config;
