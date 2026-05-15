/** @type {import('tailwindcss').Config} */
export default {
  // Scan all source files for class usage
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#FFE600",
          hover: "#FFF176",
          muted: "rgba(255,230,0,0.15)",
        },
      },
      // Smooth custom box-shadow for focused PDF fields
      boxShadow: {
        "focus-field": "0 0 0 2px #FFE600, 0 0 14px 4px rgba(255,230,0,0.35)",
        "idle-field": "0 0 0 1.5px rgba(59,130,246,0.5)",
      },
    },
  },
  plugins: [],
};
