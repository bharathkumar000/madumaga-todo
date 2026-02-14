/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#4F46E5', // Indigo-Blue
                secondary: '#14B8A6', // Teal
                background: '#1F2937', // Dark Grey (approx)
                card: '#374151', // Darker Grey (approx)
            }
        },
    },
    plugins: [],
}
