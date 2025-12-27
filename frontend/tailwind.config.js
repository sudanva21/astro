export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          dark: '#101010',
          grey: '#222222',
          light: '#4A4A4A',
          teal: '#1E3A3A',
        },
        border: 'hsl(0, 0%, 90%)',
        input: 'hsl(0, 0%, 90%)',
        ring: 'hsl(0, 0%, 20%)',
        background: 'hsl(0, 0%, 100%)',
        foreground: 'hsl(0, 0%, 0%)',
        primary: {
          DEFAULT: 'hsl(0, 0%, 0%)',
          foreground: 'hsl(0, 0%, 100%)',
        },
        secondary: {
          DEFAULT: 'hsl(0, 0%, 96%)',
          foreground: 'hsl(0, 0%, 0%)',
        },
        destructive: {
          DEFAULT: 'hsl(0, 84%, 60%)',
          foreground: 'hsl(0, 0%, 100%)',
        },
        muted: {
          DEFAULT: 'hsl(0, 0%, 96%)',
          foreground: 'hsl(0, 0%, 45%)',
        },
        accent: {
          DEFAULT: 'hsl(0, 0%, 96%)',
          foreground: 'hsl(0, 0%, 0%)',
        },
        popover: {
          DEFAULT: 'hsl(0, 0%, 100%)',
          foreground: 'hsl(0, 0%, 0%)',
        },
        card: {
          DEFAULT: 'hsl(0, 0%, 100%)',
          foreground: 'hsl(0, 0%, 0%)',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      boxShadow: {
        'neo-sm': '6px 6px 12px rgba(0, 0, 0, 0.12), -6px -6px 12px rgba(255, 255, 255, 1)',
        'neo': '10px 10px 20px rgba(0, 0, 0, 0.18), -10px -10px 20px rgba(255, 255, 255, 1)',
        'neo-lg': '15px 15px 30px rgba(0, 0, 0, 0.22), -15px -15px 30px rgba(255, 255, 255, 1)',
        'neo-xl': '20px 20px 40px rgba(0, 0, 0, 0.25), -20px -20px 40px rgba(255, 255, 255, 1)',
        'neo-inset': 'inset 6px 6px 12px rgba(0, 0, 0, 0.15), inset -6px -6px 12px rgba(255, 255, 255, 0.8)',
        'neo-hover': '14px 14px 28px rgba(0, 0, 0, 0.28), -14px -14px 28px rgba(255, 255, 255, 1)',
        'neo-button': '8px 8px 16px rgba(0, 0, 0, 0.2), -4px -4px 12px rgba(255, 255, 255, 0.9)',
        'neo-button-active': 'inset 4px 4px 8px rgba(0, 0, 0, 0.25), inset -2px -2px 6px rgba(255, 255, 255, 0.1)',
      },
      animation: {
        'orbit': 'orbit 20s linear infinite',
        'orbit-slow': 'orbit 40s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(150px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(150px) rotate(-360deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
      },
    },
  },
  plugins: [],
}
