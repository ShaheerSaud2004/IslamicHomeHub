/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Islamic green theme
        islamic: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // News category colors
        categories: {
          religious: '#059669',
          politics: '#dc2626',
          community: '#2563eb',
          education: '#7c3aed',
          culture: '#d97706',
          economics: '#4f46e5',
          health: '#ec4899',
          technology: '#6b7280',
          world: '#ea580c',
          sports: '#0d9488',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['Noto Sans Arabic', 'Arial', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#374151',
            lineHeight: '1.75',
            p: {
              marginTop: '1.25em',
              marginBottom: '1.25em',
            },
            'h1, h2, h3, h4': {
              color: '#111827',
              fontWeight: '600',
            },
            h1: {
              fontSize: '2.25em',
              marginTop: '0',
              marginBottom: '0.8888889em',
              lineHeight: '1.1111111',
            },
            h2: {
              fontSize: '1.5em',
              marginTop: '2em',
              marginBottom: '1em',
              lineHeight: '1.3333333',
            },
            h3: {
              fontSize: '1.25em',
              marginTop: '1.6em',
              marginBottom: '0.6em',
              lineHeight: '1.6',
            },
            blockquote: {
              fontWeight: '500',
              fontStyle: 'italic',
              color: '#374151',
              borderLeftWidth: '0.25rem',
              borderLeftColor: '#d1d5db',
              quotes: '"\\201C""\\201D""\\2018""\\2019"',
              marginTop: '1.6em',
              marginBottom: '1.6em',
              paddingLeft: '1em',
            },
            code: {
              color: '#111827',
              fontWeight: '600',
              fontSize: '0.875em',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            a: {
              color: '#059669',
              textDecoration: 'underline',
              fontWeight: '500',
            },
            'a:hover': {
              color: '#047857',
            },
          },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'islamic-pattern': "url('/images/islamic-pattern.svg')",
      },
      boxShadow: {
        'article': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'article-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    // Custom plugin for line clamping
    function({ addUtilities }) {
      const newUtilities = {
        '.line-clamp-1': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '1',
        },
        '.line-clamp-2': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '2',
        },
        '.line-clamp-3': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '3',
        },
        '.line-clamp-4': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '4',
        },
      }
      addUtilities(newUtilities)
    }
  ],
} 