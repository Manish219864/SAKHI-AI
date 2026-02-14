/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#FF4081", // Sakhi Pink
                secondary: "#3F51B5", // Sakhi Blue
                accent: "#FFC107", // Sakhi Yellow/Warning
                danger: "#F44336", // SOS Red
                success: "#4CAF50", // Safe Green
            }
        },
    },
    plugins: [],
}
