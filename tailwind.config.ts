import type { Config } from "tailwindcss";

/**
 * Paleta oficial de EDUKIDS.
 * Los tokens se exponen como utilidades Tailwind: bg-brand-cyan, text-brand-yellow, etc.
 */
const config: Config = {
  theme: {
    extend: {
      colors: {
        "brand-cyan": "#00BCEB",
        "brand-yellow": "#FFC800",
        "brand-coral": "#FF6B6B",
        "brand-orange": "#FFAA67",
        "brand-darkblue": "#0E1B38",
        "brand-light": "#F8FAFC",
      },
    },
  },
};

export default config;
