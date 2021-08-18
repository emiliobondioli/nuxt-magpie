const { resolve } = require('path')

module.exports = {
  target: 'static',
  ssr: true,
  rootDir: resolve(__dirname, '..'),
  buildDir: resolve(__dirname, '.nuxt'),
  srcDir: __dirname,
  head: {
    title: 'Nuxt Magpie Test',
    meta: [
      {
        hid: 'twitter:image',
        name: 'twitter:image',
        content: 'https://nuxtjs.org/nuxt-card.png'
      }
    ]
  },
  modules: [
    {
      handler: require('../'),
      options: {
        baseUrl: '',
        alias: { '/uploads': 'http://localhost:1337/uploads' },
        keepFolderStructure: false
      }
    }
  ]
}
