/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'claude-purple': '#7F5BD5',
        'claude-background': '#FFFFFF',
        'claude-gray': '#F9FAFB',
        'claude-border': '#E5E7EB',
        'claude-text': '#374151',
        'claude-input-text': '#111827',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.claude-text'),
            a: {
              color: theme('colors.claude-purple'),
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