module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      transitionProperty: {
        'height': 'height'
      }
    }
  },
  plugins: [],
  variants: {
    height: ['responsive', 'hover', 'focus']
  }
}
