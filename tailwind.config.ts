import type { Config } from "tailwindcss";

export default <Partial<Config>>{
  content: [],
  theme: {
    extend: {
      colors: {
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        card: "var(--card)",
        raised: "var(--raised)",
        line: "var(--line)",
        ink: "var(--ink)",
        dim: "var(--dim)",
        faint: "var(--faint)",
        water: "var(--water)",
        "water-2": "var(--water-2)",
        "water-soft": "var(--water-soft)",
        alcohol: "var(--alcohol)",
        "alcohol-2": "var(--alcohol-2)",
        "alcohol-soft": "var(--alcohol-soft)",
        move: "var(--move)",
        "move-2": "var(--move-2)",
        "move-soft": "var(--move-soft)",
        food: "var(--food)",
        "food-2": "var(--food-2)",
        "food-soft": "var(--food-soft)",
      },
      fontFamily: {
        sans: ["Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Bricolage Grotesque", "Outfit", "sans-serif"],
      },
      borderRadius: { "4xl": "28px", "5xl": "34px" },
      boxShadow: { soft: "var(--shadow)", lift: "var(--shadow-lift)" },
    },
  },
};
