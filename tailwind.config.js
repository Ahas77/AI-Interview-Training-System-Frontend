module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Include all your component files
    "./node_modules/flowbite/**/*.js", // Add Flowbite's JS content for proper scanning
  ],
  theme: {
    extend: {
      colors: {
        theme: '#001456', // Custom theme color
        brand: {
          DEFAULT: '#0E8C86',
          dark: '#0C7873',
          darker: '#0A625E',
          navy: '#0B3538',
          accent: '#C9A227',
        },
      },
      screens: {
        sm: '640px', // Small devices (mobile)
        md: '768px', // Tablets
        ipad: { min: '1024px', max: '1366px' }, // Custom iPad breakpoint
        lg: '1024px', // Desktops
        xl: '1280px', // Extra-large screens
        '2xl': '1536px', // Larger screens
      },
    },
  },
  plugins: [
    require('flowbite/plugin'), // Include Flowbite plugin
  ],
};


