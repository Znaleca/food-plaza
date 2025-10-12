/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "accent-pink-600", // ✅ keep accent color for checkbox
    "checked:bg-pink-600", // ✅ fallback checked state
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      // --- ADDED for A4 print reference ---
      maxWidth: {
        'a4': '794px', // Standard A4 width for web viewing (96 DPI)
      },
      // ------------------------------------
      animation: {
        'spin-slow-on-hover': 'spin 3s linear infinite',
        'fade-in-up': 'fadeInUp 1s ease-out forwards',
        'fade-in': 'fadeIn 1s ease-out forwards',
        'spin-slow': 'spin 8s linear infinite',
        'spin-slow-reverse': 'spin-reverse 8s linear infinite',
        'pulse-slow': 'pulse-slow 8s infinite ease-in-out',
        'bounce-smooth': 'bounceSmooth 0.9s ease-out forwards',
      },
      keyframes: {
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'spin-reverse': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(-360deg)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-slow': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.15' },
          '50%': { transform: 'scale(1.05)', opacity: '0.25' },
        },
        bounceSmooth: {
          '0%': { transform: 'scale(0.8) translateY(20px)', opacity: '0' },
          '60%': { transform: 'scale(1.15) translateY(-8px)', opacity: '1' },
          '80%': { transform: 'scale(0.95) translateY(4px)' },
          '100%': { transform: 'scale(1) translateY(0)' },
        },
      },
    },
  },
  plugins: [
    // --- ADDED CUSTOM PLUGIN FOR PRINT STYLES ---
    function ({ addUtilities }) {
      const newUtilities = {
        '@media print': {
          // Enforce Times New Roman and 12pt on the contract content
          'body, .print-preview': {
            'font-family': '"Times New Roman", Times, serif !important',
            'font-size': '12pt !important',
          },
          // Ensure pages break cleanly and use physical A4 dimensions
          '.page': {
            'page-break-after': 'always',
            'margin': '0 !important',
            'box-shadow': 'none !important', // Remove shadows for print
            'border': 'none !important', // Remove borders for print
            'width': '210mm', // Physical A4 width
            'height': '297mm', // Physical A4 height
            'padding': '15mm !important', // A good standard print margin
          },
          '.page:last-child': {
            'page-break-after': 'avoid', // Don't break after the last page
          },
        },
      };
      addUtilities(newUtilities, ['responsive', 'print']);
    },
    // ---------------------------------------------
  ],
};