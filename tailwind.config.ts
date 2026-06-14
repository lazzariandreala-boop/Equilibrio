import type { Config } from "tailwindcss";

export default <Partial<Config>>{
  content: [],
  theme: {
    extend: {
      colors: {
        surface: "var(--surface)",
        card: "var(--card)",
        raised: "var(--raised)",
        line: "var(--line)",
        ink: "var(--ink)",
        dim: "var(--dim)",
        faint: "var(--faint)",
        water: "var(--water)",
        "water-soft": "var(--water-soft)",
        alcohol: "var(--alcohol)",
        "alcohol-soft": "var(--alcohol-soft)",
        move: "var(--move)",
        "move-soft": "var(--move-soft)",
        food: "var(--food)",
        "food-soft": "var(--food-soft)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: { "4xl": "28px" },
      boxShadow: { soft: "var(--shadow)" },
    },
  },
};
