import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      colors: {
        primary: "#41D3BD",
        secondary: "#26547C",
        highlight: "#EF476F",
        highlight2: "#FFD166",
        white: "#FFFFFF",
        muted: "#F1FAEE",
      },
    },
  },
  plugins: [],
} satisfies Config;
