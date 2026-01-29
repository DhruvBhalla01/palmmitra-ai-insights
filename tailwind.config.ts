import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold))",
          light: "hsl(var(--gold-light))",
          dark: "hsl(var(--gold-dark))",
          glow: "hsl(var(--gold-glow))",
        },
        indigo: {
          deep: "hsl(var(--indigo-deep))",
          light: "hsl(var(--indigo-light))",
        },
        cream: {
          DEFAULT: "hsl(var(--cream))",
          dark: "hsl(var(--cream-dark))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in-up": {
          from: { 
            opacity: "0",
            transform: "translateY(30px)"
          },
          to: { 
            opacity: "1",
            transform: "translateY(0)"
          },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { 
            opacity: "0",
            transform: "scale(0.95)"
          },
          to: { 
            opacity: "1",
            transform: "scale(1)"
          },
        },
        "slide-in-right": {
          from: { 
            opacity: "0",
            transform: "translateX(30px)"
          },
          to: { 
            opacity: "1",
            transform: "translateX(0)"
          },
        },
        "float": {
          "0%, 100%": { 
            transform: "translateY(0px)"
          },
          "50%": { 
            transform: "translateY(-10px)"
          },
        },
        "float-gentle": {
          "0%, 100%": { 
            transform: "translateY(0px) rotate(0deg)"
          },
          "25%": {
            transform: "translateY(-5px) rotate(1deg)"
          },
          "50%": { 
            transform: "translateY(-8px) rotate(0deg)"
          },
          "75%": {
            transform: "translateY(-5px) rotate(-1deg)"
          },
        },
        "glow-pulse": {
          "0%, 100%": { 
            opacity: "0.5",
            transform: "scale(1)"
          },
          "50%": { 
            opacity: "1",
            transform: "scale(1.05)"
          },
        },
        "glow-pulse-gold": {
          "0%, 100%": {
            boxShadow: "0 0 20px hsl(var(--gold) / 0.3)"
          },
          "50%": {
            boxShadow: "0 0 40px hsl(var(--gold) / 0.6), 0 0 60px hsl(var(--gold) / 0.3)"
          },
        },
        "reveal-up": {
          from: {
            opacity: "0",
            transform: "translateY(40px) scale(0.95)"
          },
          to: {
            opacity: "1",
            transform: "translateY(0) scale(1)"
          },
        },
        "shimmer-sweep": {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "sparkle": {
          "0%, 100%": { 
            opacity: "0.3",
            transform: "scale(0.8)"
          },
          "50%": { 
            opacity: "1",
            transform: "scale(1.2)"
          },
        },
        "hologram-scan": {
          "0%": { top: "0%" },
          "100%": { top: "100%" },
        },
        "rotate-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "mandala-pulse": {
          "0%, 100%": {
            opacity: "0.1",
            transform: "scale(1) rotate(0deg)"
          },
          "50%": {
            opacity: "0.2",
            transform: "scale(1.02) rotate(3deg)"
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "scale-in": "scale-in 0.5s ease-out forwards",
        "slide-in-right": "slide-in-right 0.6s ease-out forwards",
        "float": "float 3s ease-in-out infinite",
        "float-gentle": "float-gentle 6s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "glow-pulse-gold": "glow-pulse-gold 3s ease-in-out infinite",
        "reveal-up": "reveal-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "shimmer": "shimmer-sweep 3s ease-in-out infinite",
        "sparkle": "sparkle 2s ease-in-out infinite",
        "hologram-scan": "hologram-scan 4s linear infinite",
        "rotate-slow": "rotate-slow 30s linear infinite",
        "rotate-reverse": "rotate-slow 20s linear infinite reverse",
        "mandala-pulse": "mandala-pulse 8s ease-in-out infinite",
      },
      boxShadow: {
        'soft': '0 4px 20px -4px hsl(var(--primary) / 0.1)',
        'gold': '0 4px 30px -4px hsl(var(--gold) / 0.4)',
        'gold-lg': '0 10px 40px -8px hsl(var(--gold) / 0.5)',
        'elevated': '0 20px 50px -12px hsl(var(--primary) / 0.15)',
        'premium': '0 25px 60px -15px hsl(var(--primary) / 0.2), 0 10px 30px -10px hsl(var(--gold) / 0.15)',
        'glow-gold': '0 0 30px hsl(var(--gold) / 0.4)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;