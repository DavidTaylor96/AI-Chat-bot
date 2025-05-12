module.exports = {
  launch: {
    headless: 'new',
    defaultViewport: {
      width: 1280,
      height: 800
    },
    slowMo: 10, // Slows down Puppeteer operations by the specified amount of milliseconds
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  },
  server: {
    command: 'npm run start',
    port: 3000,
    launchTimeout: 60000, // Give the server 60 seconds to start
    debug: true
  }
}