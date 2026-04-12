/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#050912',
          900: '#0a0f1a',
          800: '#0f1728',
          700: '#161f38',
          600: '#1e2d4a',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
        },
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-dots': 'bounceDots 1.4s ease-in-out infinite both',
        'gradient-shift': 'gradientShift 4s ease infinite',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.3s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'orbit': 'orbitSpin 3s linear infinite',
        'step-reveal': 'stepReveal 0.35s cubic-bezier(0.16,1,0.3,1) both',
        'float-badge': 'floatBadge 3s ease-in-out infinite',
        'send-pulse': 'sendPulse 2s ease-in-out infinite',
        'border-glow': 'borderGlow 2s ease-in-out infinite',
      },
      keyframes: {
        bounceDots: {
          '0%, 80%, 100%': { transform: 'scale(0)', opacity: '0.3' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(34, 211, 238, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(34, 211, 238, 0.5)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        orbitSpin: {
          from: { transform: 'rotate(0deg) translateX(52px) rotate(0deg)' },
          to:   { transform: 'rotate(360deg) translateX(52px) rotate(-360deg)' },
        },
        stepReveal: {
          from: { opacity: '0', transform: 'translateX(-8px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        floatBadge: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-3px)' },
        },
        sendPulse: {
          '0%, 100%': { boxShadow: '0 0 16px rgba(34,211,238,0.25)' },
          '50%':       { boxShadow: '0 0 28px rgba(34,211,238,0.55), 0 0 8px rgba(139,92,246,0.3)' },
        },
        borderGlow: {
          '0%, 100%': { borderColor: 'rgba(34,211,238,0.2)' },
          '50%':       { borderColor: 'rgba(34,211,238,0.5)' },
        },
      },
      backgroundSize: {
        '200%': '200% 200%',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
