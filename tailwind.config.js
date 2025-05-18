/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'Taylor-purple': '#7F5BD5',
        'Taylor-background': '#FFFFFF',
        'Taylor-gray': '#F9FAFB',
        'Taylor-border': '#E5E7EB',
        'Taylor-text': '#374151',
        'Taylor-input-text': '#111827',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.Taylor-text'),
            a: {
              color: theme('colors.Taylor-purple'),
              '&:hover': {
                color: '#6842C2',
              },
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            code: {
              fontWeight: '400',
              backgroundColor: '#F3F4F6',
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontSize: '0.875em',
            },
            pre: {
              backgroundColor: '#1E1E1E',
              color: '#fff',
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}