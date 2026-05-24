/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkSpace: {
          900: '#030308',
          800: '#080816',
          700: '#0f0f26',
          600: '#171738',
        },
        neonBlue: {
          DEFAULT: '#00f2fe',
          glow: 'rgba(0, 242, 254, 0.4)',
        },
        neonPurple: {
          DEFAULT: '#b92bff',
          glow: 'rgba(185, 43, 255, 0.4)',
        },
        cyanGlow: {
          DEFAULT: '#00ff87',
          glow: 'rgba(0, 255, 135, 0.4)',
        },
        neonRed: {
          DEFAULT: '#ff007f',
          glow: 'rgba(255, 0, 127, 0.4)'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-blue': '0 0 15px rgba(0, 242, 254, 0.35)',
        'neon-purple': '0 0 15px rgba(185, 43, 255, 0.35)',
        'neon-cyan': '0 0 15px rgba(0, 255, 135, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scanLine 3s linear infinite',
      },
      keyframes: {
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [],
}
