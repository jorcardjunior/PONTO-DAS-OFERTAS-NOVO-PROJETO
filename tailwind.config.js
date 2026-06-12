/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        'on-primary': '#ffffff',
        'primary-container': '#dbeafe',
        'on-primary-container': '#1e3a8a',
        secondary: '#475569',
        'on-secondary': '#ffffff',
        'secondary-container': '#f1f5f9',
        'on-secondary-container': '#1e293b',
        tertiary: '#7c3aed',
        'on-tertiary': '#ffffff',
        error: '#dc2626',
        'on-error': '#ffffff',
        surface: '#faf8ff',
        'on-surface': '#1a1c1e',
        'surface-variant': '#e1e2ec',
        'on-surface-variant': '#44474e',
        outline: '#74777f',
        'surface-container-low': '#f3f3fe',
        'surface-container': '#ededf7',
        'surface-container-high': '#e7e7f2',
        'surface-container-highest': '#e2e2ec',
        'dark-bg': '#0f0a1a',
        'dark-card': '#1a1228',
        'dark-border': '#2a2040',
        'dark-text': '#f1eef9',
        'dark-muted': '#7a6e96',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      }
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
