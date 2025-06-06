import defaultTheme from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';
import typographyPlugin from '@tailwindcss/typography';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,json,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
  	extend: {
      keyframes: {
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(-10%)' },
          '50%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        'bounce-slow': 'bounce-slow 2s ease-in-out infinite',
      },
  		colors: {
  			primary: 'var(--ootb-turquoise)',
  			secondary: {
  				DEFAULT: 'var(--secondary)',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			accent: {
  				DEFAULT: 'var(--accent)',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			default: 'var(--aw-color-text-default)',
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
        content: {
          actualite: 'var(--content-actualite)',
          live: 'var(--content-live)',
          fiche: 'var(--content-fiche)',
          podcast: 'var(--content-podcast)',
          tv: 'var(--content-tv)',
          premium: 'var(--content-premium)'
        }
  		},
  		fontFamily: {
  			display: ['Plus Jakarta Sans', ...defaultTheme.fontFamily.sans],
  			sans: [
  				'var(--aw-font-sans, ui-sans-serif)',
                    ...defaultTheme.fontFamily.sans
                ],
  			serif: [
  				'var(--aw-font-serif, ui-serif)',
                    ...defaultTheme.fontFamily.serif
                ],
  			heading: [
  				'var(--aw-font-heading, ui-sans-serif)',
                    ...defaultTheme.fontFamily.sans
                ],
  			'montserrat': ['Montserrat', 'sans-serif'],
  		},
  		animation: {
  			fade: 'fadeInUp 1s both'
  		},
  		keyframes: {
  			fadeInUp: {
  				'0%': {
  					opacity: 0,
  					transform: 'translateY(2rem)'
  				},
  				'100%': {
  					opacity: 1,
  					transform: 'translateY(0)'
  				}
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [
    typographyPlugin,
    plugin(({ addVariant }) => {
      addVariant('intersect', '&:not([no-intersect])');
    }),
      require("tailwindcss-animate")
],
  darkMode: ['class', 'class'],
};
