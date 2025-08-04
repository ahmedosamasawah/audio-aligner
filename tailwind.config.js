import { fontFamily } from "tailwindcss/defaultTheme";
import plugin from "tailwindcss/plugin";
import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./node_modules/components/src/*.svelte",
    "./src/**/*.{html,js,svelte,ts}",
  ],
  safelist: ["dark"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        text: "var(--text)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        success: {
          DEFAULT: "var(--success)",
          foreground: "var(--success-foreground)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          foreground: "var(--warning-foreground)",
        },
        info: {
          DEFAULT: "var(--info)",
          foreground: "var(--info-foreground)",
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--bits-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--bits-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
      fontFamily: {
        sans: ["NotoNaskhArabicFull", ...fontFamily.sans],
        arabic: ["NotoNaskhArabicFull", "Kitab", "system-ui", "sans-serif"],
        prose: ["Kitab", "serif"],
      },
      listStyleType: {
        arabic: "arabic-indic",
      },
    },
  },
  plugins: [
    tailwindcssAnimate,
    plugin(function ({ addBase }) {
      addBase({
        ":root": {
          "--background": "#FFFFFF",
          "--foreground": "#0F1729",
          "--muted": "#F1F5F9",
          "--text": "#000000",
          "--muted-foreground": "#64748B",
          "--popover": "#FFFFFF",
          "--popover-foreground": "#0F1729",
          "--card": "#FFFFFF",
          "--card-foreground": "#0F1729",
          "--border": "#E2E8F0",
          "--input": "#E2E8F0",
          "--primary": "#1E293B",
          "--primary-foreground": "#F8FAFC",
          "--secondary": "#F1F5F9",
          "--secondary-foreground": "#1E293B",
          "--accent": "#F1F5F9",
          "--accent-foreground": "#1E293B",
          "--destructive": "#EF4444",
          "--destructive-foreground": "#F8FAFC",
          "--ring": "#0F1729",
          "--radius": "0.5rem",
          "--sidebar-background": "#FAFAFA",
          "--sidebar-foreground": "#3F3F46",
          "--sidebar-primary": "#18181B",
          "--sidebar-primary-foreground": "#FAFAFA",
          "--sidebar-accent": "#F4F4F5",
          "--sidebar-accent-foreground": "#18181B",
          "--sidebar-border": "#E4E4E7",
          "--sidebar-ring": "#3B82F6",
          "--success": "#22C55E",
          "--success-foreground": "#F8FAFC",
          "--warning": "#EAB308",
          "--warning-foreground": "#F8FAFC",
          "--info": "#3B82F6",
          "--info-foreground": "#F8FAFC",

          /* Scrollbar */
          "--scrollbar-size": "8px",
          "--scrollbar-track": "#F1F5F9",
          "--scrollbar-thumb": "#CBD5E1",
          "--scrollbar-thumb-hover": "#94A3B8",
        },
        ".dark": {
          "--background": "#080d1d",
          "--foreground": "#F8FAFC",
          "--muted": "#1E293B",
          "--text": "#ffffff",
          "--muted-foreground": "#94A3B8",
          "--popover": "#080d1d",
          "--popover-foreground": "#F8FAFC",
          "--card": "#080d1d",
          "--card-foreground": "#F8FAFC",
          "--border": "#1E293B",
          "--input": "#1E293B",
          "--primary": "#F8FAFC",
          "--primary-foreground": "#1E293B",
          "--secondary": "#1E293B",
          "--secondary-foreground": "#F8FAFC",
          "--accent": "#1E293B",
          "--accent-foreground": "#F8FAFC",
          "--destructive": "#7F1D1D",
          "--destructive-foreground": "#F8FAFC",
          "--ring": "#CBD5E1",
          "--sidebar-background": "#18181B",
          "--sidebar-foreground": "#F4F4F5",
          "--sidebar-primary": "#3B82F6",
          "--sidebar-primary-foreground": "#FFFFFF",
          "--sidebar-accent": "#27272A",
          "--sidebar-accent-foreground": "#F4F4F5",
          "--sidebar-border": "#27272A",
          "--sidebar-ring": "#3B82F6",
          "--success": "#16A34A",
          "--success-foreground": "#F8FAFC",
          "--warning": "#CA8A04",
          "--warning-foreground": "#F8FAFC",
          "--info": "#2563EB",
          "--info-foreground": "#F8FAFC",

          /* Scrollbar for dark mode */
          "--scrollbar-track": "#1E293B",
          "--scrollbar-thumb": "#475569",
          "--scrollbar-thumb-hover": "#64748B",
        },
        /* Global scrollbar styling */
        "*": {
          /* Firefox */
          "scrollbar-width": "thin",
          "scrollbar-color": "var(--scrollbar-thumb) var(--scrollbar-track)",
        },
        /* Webkit browsers */
        "::-webkit-scrollbar": {
          width: "var(--scrollbar-size)",
          height: "var(--scrollbar-size)",
        },
        "::-webkit-scrollbar-track": {
          background: "var(--scrollbar-track)",
        },
        "::-webkit-scrollbar-thumb": {
          background: "var(--scrollbar-thumb)",
          "border-radius": "9999px",
        },
        "::-webkit-scrollbar-thumb:hover": {
          background: "var(--scrollbar-thumb-hover)",
        },
        'html[dir="rtl"]': {
          fontFamily: [
            "SafariFakeFont",
            "NotoNaskhArabicFull",
            "Noto",
            ...fontFamily.sans,
          ].join(", "),
        },
      });
    }),
  ],
};
