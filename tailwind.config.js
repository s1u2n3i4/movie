/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Cinema-at-night palette. Named tokens, not framework defaults.
        ink: "#0B0C10",        // near-black background, faint blue undertone
        panel: "#14161B",      // card / surface
        panel2: "#1B1E25",     // raised surface (hover, inputs)
        marquee: "#E4A94E",    // marquee-bulb gold, primary accent
        velvet: "#C1443C",     // velvet-curtain red, secondary accent (ratings, live)
        bone: "#F3F1EA",       // primary text
        smoke: "#8A8F98",      // muted text
        line: "#23262E",       // hairline borders
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      backgroundImage: {
        "film-grain": "radial-gradient(circle at 1px 1px, rgba(243,241,234,0.035) 1px, transparent 0)",
        "perf": "repeating-linear-gradient(90deg, #23262E 0 6px, transparent 6px 14px)",
      },
      boxShadow: {
        card: "0 10px 30px -12px rgba(0,0,0,0.6)",
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};
