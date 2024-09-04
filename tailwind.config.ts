import type { Config } from 'tailwindcss';
import dotenv from 'dotenv';

// Cargar las variables de entorno desde el archivo .env.local
dotenv.config();

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        primary: process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#4CAF50', // Valor por defecto si no se define en .env
        secondary: process.env.NEXT_PUBLIC_SECUNDARY_COLOR || '#FFC107', // Valor por defecto
      },
      fontFamily: {
        primary: [process.env.NEXT_PUBLIC_PRIMARY_FONT || 'Roboto', 'sans-serif'],
        secondary: [process.env.NEXT_PUBLIC_SECUNDARY_FONT || 'Open Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
