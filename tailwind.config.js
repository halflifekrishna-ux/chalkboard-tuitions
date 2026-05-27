/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        board: "#1e3a2f",
        "board-deep": "#162d24",
        "board-light": "#2a5040",
        forest: "#2d6a4f",
        chalk: "#f5f0e8",
        "chalk-yellow": "#f4c430",
        gold: "#c9a227",
        "chalk-orange": "#e8784d",
        cream: "#fdf6e3",
        "cream-bg": "#faf8f4",
        "chalk-dark": "#1a1a2e",
        "chalk-pink": "#e8a0b4",
        "chalk-blue": "#4a9eca",
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-dm-sans)", "sans-serif"],
        "special-elite": ["var(--font-special-elite)", "cursive"],
      },
      backgroundImage: {
        "chalk-lines":
          "repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(255,255,255,0.04) 27px, rgba(255,255,255,0.04) 28px)",
        "chalk-lines-light":
          "repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(0,0,0,0.02) 27px, rgba(0,0,0,0.02) 28px)",
      },
      animation: {
        shimmer2: "shimmer2 2s infinite linear",
        first: "moveVertical 30s ease infinite",
        second: "moveInCircle 20s reverse infinite",
        third: "moveInCircle 40s linear infinite",
        fourth: "moveHorizontal 40s ease infinite",
        fifth: "moveInCircle 20s ease infinite",
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
        spotlight: "spotlight 2s ease 0.75s 1 forwards",
        shimmer: "shimmer 3s linear infinite",
        "border-beam": "borderBeam 4s linear infinite",
        "count-up": "countUp 2s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        spotlight: {
          "0%": { opacity: "0", transform: "translate(-72%, -62%) scale(0.5)" },
          "100%": { opacity: "1", transform: "translate(-50%, -40%) scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        borderBeam: {
          "100%": { offsetDistance: "100%" },
        },
        countUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer2: {
          "0%": { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "-200% 0%" },
        },
        moveHorizontal: {
          "0%": { transform: "translateX(-50%) translateY(-10%)" },
          "50%": { transform: "translateX(50%) translateY(10%)" },
          "100%": { transform: "translateX(-50%) translateY(-10%)" },
        },
        moveInCircle: {
          "0%": { transform: "rotate(0deg)" },
          "50%": { transform: "rotate(180deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        moveVertical: {
          "0%": { transform: "translateY(-50%)" },
          "50%": { transform: "translateY(50%)" },
          "100%": { transform: "translateY(-50%)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
