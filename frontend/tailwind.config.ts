import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: ["./app.vue", "./layers/**/*.{vue,ts}"],
  darkMode: "class",
  theme: {
  	extend: {
  		colors: {
        bgGradient: 'var(--bg-gradient)',
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
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
        night: {
          DEFAULT: 'hsl(var(--night))',
          foreground: 'hsl(var(--night-foreground))'
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
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				accent: 'hsl(var(--sidebar-accent))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-family)',
  				'sans-serif'
  			],
        warnes: [
          'var(--warnes)',
        ]
  		},
  		spacing: {
  			xs: 'var(--spacing-xs)',
  			sm: 'var(--spacing-sm)',
  			md: 'var(--spacing-md)',
  			lg: 'var(--spacing-lg)',
  			xl: 'var(--spacing-xl)'
  		},
  		borderRadius: {
  			DEFAULT: 'var(--radius)',
  			sm: 'var(--radius-sm)',
  			md: 'var(--radius-md)',
  			lg: 'var(--radius-lg)'
  		},
  		boxShadow: {
  			sm: 'var(--shadow-sm)',
  			md: 'var(--shadow-md)',
  			lg: 'var(--shadow-lg)'
  		},
  		keyframes: {
  			'fade-left': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateX(2rem)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateX(0)'
  				}
  			}
  		},
  		animation: {
  			'fade-left': 'fade-left 0.2s ease'
  		}
  	}
  },
  plugins: [],
};
