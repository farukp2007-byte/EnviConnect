/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        envi: {
          dark: "#04120F",        // Page background near-black green
          surface: "#08231E",     // Slightly lighter background surface
          panel: "#0C4137",       // Brunswick Green for cards, panels, sidebar
          panelHover: "#125246",
          panelBorder: "rgba(6, 214, 160, 0.18)",
          emerald: "#06D6A0",     // Emerald for primary buttons, active highlights
          emeraldHover: "#05B789",
          emeraldGlow: "rgba(6, 214, 160, 0.35)",
          polar: "#E6FBF6",       // Polar for primary text
          polarMuted: "#A2C5BD",  // Muted secondary text
          polarDim: "#659389",    // Dim metadata text
          accent: "#06D6A0",
          danger: "#EF4444",      // Critical severity
          warning: "#F97316",     // High severity
          caution: "#FBBF24",     // Medium severity
          success: "#06D6A0",     // Low severity / resolved
        }
      },
      fontFamily: {
        serif: ["'Playfair Display'", "'Cormorant Garamond'", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '28px',
      },
      backgroundImage: {
        'emerald-brunswick': 'linear-gradient(180deg, #06D6A0 0%, #0C4137 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(12, 65, 55, 0.95) 0%, rgba(8, 35, 30, 0.9) 100%)',
        'hero-gradient': 'radial-gradient(circle at 50% 20%, rgba(6, 214, 160, 0.15) 0%, rgba(12, 65, 55, 0.25) 45%, rgba(4, 18, 15, 0) 70%)',
      }
    },
  },
  plugins: [],
}
