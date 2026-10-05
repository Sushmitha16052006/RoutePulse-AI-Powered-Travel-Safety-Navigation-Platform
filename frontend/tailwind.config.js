/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        primary:   '#FF2D55',
        secondary: '#FF6B9D',
        accent:    '#8B5CF6',
        dark:      '#0A0A0F',
        'dark-2':  '#0F0F1A',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #FF2D55 0%, #FF6B9D 50%, #8B5CF6 100%)',
      },
      animation: {
        'spin-slow':    'spin 3s linear infinite',
        'float':        'float 4s ease-in-out infinite',
        'float-slow':   'floatSlow 6s ease-in-out infinite',
        'glow-pulse':   'glowPulse 2s ease-in-out infinite',
        'sos-shake':    'sosShake 0.6s ease',
        'sos-ring-1':   'pulseRing 2.5s ease-out infinite',
        'sos-ring-2':   'pulseRing2 2.5s ease-out infinite 0.4s',
        'sos-ring-3':   'pulseRing3 2.5s ease-out infinite 0.8s',
        'fade-in':      'fadeIn 0.5s ease forwards',
        'fade-in-up':   'fadeInUp 0.6s ease forwards',
        'fade-in-down': 'fadeInDown 0.5s ease forwards',
        'scale-in':     'scaleIn 0.5s ease forwards',
        'shimmer':      'shimmer 2s linear infinite',
        'mesh-drift':   'meshDrift 20s ease-in-out infinite',
      },
      keyframes: {
        float:      { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
        floatSlow:  { '0%,100%': { transform: 'translateY(0px) rotate(0deg)' }, '50%': { transform: 'translateY(-16px) rotate(3deg)' } },
        glowPulse:  {
          '0%,100%': { boxShadow: '0 0 20px rgba(255,45,85,0.4), 0 0 40px rgba(255,45,85,0.2)' },
          '50%':     { boxShadow: '0 0 40px rgba(255,45,85,0.7), 0 0 80px rgba(255,45,85,0.3)' },
        },
        sosShake: {
          '0%,100%':             { transform: 'translateX(0)' },
          '10%,30%,50%,70%,90%': { transform: 'translateX(-4px) rotate(-1deg)' },
          '20%,40%,60%,80%':     { transform: 'translateX(4px) rotate(1deg)' },
        },
        pulseRing:  { '0%': { transform: 'scale(1)', opacity: '0.8' }, '100%': { transform: 'scale(2.2)', opacity: '0' } },
        pulseRing2: { '0%': { transform: 'scale(1)', opacity: '0.6' }, '100%': { transform: 'scale(2.8)', opacity: '0' } },
        pulseRing3: { '0%': { transform: 'scale(1)', opacity: '0.4' }, '100%': { transform: 'scale(3.4)', opacity: '0' } },
        fadeIn:     { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeInUp:   { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeInDown: { from: { opacity: '0', transform: 'translateY(-20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:    { from: { opacity: '0', transform: 'scale(0.85)' }, to: { opacity: '1', transform: 'scale(1)' } },
        shimmer:    { '0%': { backgroundPosition: '-200% center' }, '100%': { backgroundPosition: '200% center' } },
        meshDrift: {
          '0%':   { transform: 'translate(0, 0) rotate(0deg)' },
          '33%':  { transform: 'translate(30px, -20px) rotate(120deg)' },
          '66%':  { transform: 'translate(-20px, 20px) rotate(240deg)' },
          '100%': { transform: 'translate(0, 0) rotate(360deg)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      boxShadow: {
        'glow-primary': '0 0 30px rgba(255,45,85,0.3), 0 0 60px rgba(255,45,85,0.1)',
        'glow-accent':  '0 0 30px rgba(139,92,246,0.3)',
        'card':         '0 8px 32px rgba(0,0,0,0.4)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}
