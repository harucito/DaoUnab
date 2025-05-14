/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
backgroundLight: '#ffffff', // Blanco para modo claro
        backgroundDark: '#181818', // Negro para modo oscuro
        foregroundLight: '#222222', // Negro para texto en modo claro
        foregroundDark: '#ffffff', // Blanco para texto en modo oscuro
        primary: '#f97316', // Naranja principal
        secondary: '#fb923c', // Naranja claro
        neutralLight: '#f3f4f6', // Gris claro para modo claro
        neutralDark: '#1f2937', // Gris oscuro para modo oscuro
        cardLight: '#ffffff', // Fondo de tarjetas en modo claro
        cardDark: '#1f2937', // Fondo de tarjetas en modo oscuro
        buttonHover: '#ea580c', // Hover de botones
        cardHighlight: '#ffedd5', // Resaltado de tarjetas
      },
    },
  },
  plugins: [],
};
