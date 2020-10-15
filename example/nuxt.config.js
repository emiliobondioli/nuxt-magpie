const { resolve } = require('path')

module.exports = {
  target: 'static',
  ssr: true,
  rootDir: resolve(__dirname, '..'),
  buildDir: resolve(__dirname, '.nuxt'),
  srcDir: __dirname,
  modules: [
    { handler: require('../'), options: { baseUrl: '', alias: { '/uploads': 'http://localhost:1337/uploads' } } }
  ]
}
