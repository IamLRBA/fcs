/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './sections/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEE5DA',   /* Light Almond */
          100: '#EFE9E0',  /* Soft Ivory */
          200: '#EAE0C8',  /* Pearl */
          300: '#C2B280',  /* Ecru */
          400: '#A89B6F',  /* Ecru variant */
          500: '#8B7A5A',  /* Coffee variant */
          600: '#6F4E37',  /* Coffee */
          700: '#5A3E2D',  /* Dark Coffee */
          800: '#453025',  /* Darker Coffee */
          900: '#30221C',  /* Darkest Coffee */
          950: '#1B1410',   /* Almost Black Coffee */
        },
        neutral: {
          50: '#FEFEFE',   /* Pure White */
          100: '#F8F8F8',  /* Off White */
          200: '#F0F0F0',  /* Light Gray */
          300: '#E0E0E0',  /* Light Gray */
          400: '#C0C0C0',  /* Medium Gray */
          500: '#808080',  /* Gray */
          600: '#606060',  /* Dark Gray */
          700: '#404040',  /* Darker Gray */
          800: '#252525',  /* Charcoal-2 */
          850: '#262424',  /* Deep Charcoal */
          900: '#1B1B1B',  /* Charcoal-3 */
          950: '#191919',  /* Charcoal-4 */
        },
        accent: {
          50: '#F5F0E8',    /* Light Coffee Cream */
          100: '#E8DCC8',   /* Coffee Cream */
          200: '#D4C4A8',   /* Light Coffee */
          300: '#C2B280',   /* Ecru */
          400: '#A89B6F',   /* Ecru variant */
          500: '#8B7A5A',   /* Coffee variant */
          600: '#6F4E37',   /* Coffee */
          700: '#5A3E2D',   /* Dark Coffee */
          800: '#453025',   /* Darker Coffee */
          900: '#30221C',   /* Darkest Coffee */
        },
      },
      fontFamily: {
        primary: ['MuseoModerno'],
        display: ['MuseoModerno'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
} 