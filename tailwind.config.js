module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './src/**/*.css', // Add this line
  ],
  theme: {
    extend: {
      colors: {
        background: '#111112', // Premium black
        foreground: '#F5F5F7', // Soft off-white for text
        ivory: '#232325',      // Muted dark for cards
        ash: '#2C2C2E',        // Ashy gray for borders
        orange: '#FF7A00',
        secondary: '#FF7A00'
      },
    },
  },
  plugins: [],
};