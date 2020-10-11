const fs = require('fs')
const { URL } = require('url')
const { join } = require('path')
const axios = require('axios')
const consola = require('consola')
const chalk = require('chalk')
const ProgressBar = require('progress')

const defaults = {
  path: '/_images',
  extensions: ['jpg', 'jpeg', 'gif', 'png', 'webp'],
  baseUrl: '',
  verbose: false,
  concurrency: 10
}
const consoleTitle = chalk.hex('#74ffdc')('Magpie')

module.exports = function (moduleOptions) {
  if (!this.options.ssr) {
    consola.info(`${consoleTitle} ${chalk.bold('SSR')} is disabled, bailing image replacement`)
    return
  }
  if (this.options.target !== 'static') {
    consola.info(`${consoleTitle} target is not ${chalk.bold('static')}, bailing image replacement`)
    return
  }
  const options = {
    ...defaults,
    ...this.options.magpie,
    ...moduleOptions
  }

  const baseDir = join(this.options.generate.dir, options.path)
  const images = []
  let progressBar = null

  this.nuxt.hook('generate:distCopied', (generator) => {
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir)
    }
  })

  this.nuxt.hook('generate:done', async (generator) => {
    return await saveRemoteImages()
  })

  this.nuxt.hook('generate:routeCreated', async ({ route, path, errors }) => {
    const routePath = join(
      this.options.generate.dir,
      this.options.generate.staticAssets.versionBase,
      route
    )
    const payloadPath = join(routePath, 'payload.js')
    const statePath = join(routePath, 'state.js')
    const promises = []
    if (fs.existsSync(payloadPath)) {
      promises.push(replaceImagesInFile(payloadPath, route))
    }
    if (fs.existsSync(statePath)) {
      promises.push(replaceImagesInFile(statePath, route))
    }
    return await Promise.all(promises)
  })

  this.nuxt.hook('generate:page', ({ page, errors }) => {
    const urls = getImageUrls(page.html)
    if (!urls.length) {
      return
    }
    if (options.verbose) {
      consola.info(
        `${page.route}: ${consoleTitle} replacing ${
          urls.length
        } images with local copies`
      )
    }
    page.html = replaceRemoteImages(page.html, urls)
  })

  function getImageUrls (string) {
    const urls = []
    const test = new RegExp(
      '(http(s?):)([/|.|\\w|\\s|-])*.(?:' + options.extensions.join('|') + ')',
      'g'
    )
    const matches = string.matchAll(test)
    for (const match of matches) {
      let matchBaseUrl = true
      const url = new URL(match[0])
      if (options.baseUrl) {
        const baseUrl = new URL(options.baseUrl)
        matchBaseUrl = (baseUrl.hostname === url.hostname)
      }
      if (
        matchBaseUrl &&
        !urls.find(u => u.href === url.href)
      ) {
        urls.push(url)
      }
    }
    return urls
  }

  function replaceRemoteImages (html, urls) {
    urls = urls.forEach((url) => {
      const ext = '.' + url.pathname.split('.').pop()
      const name = slugify(url.pathname.split(ext).join('')) + ext
      const imgPath = join(baseDir, name)
      if (options.verbose) {
        consola.info(`saving ${url.href}`)
      }
      const img = { url: url.href, path: imgPath, name }
      images.push(img)
      html = html.split(url.href).join(options.path + '/' + name)
    })
    return html
  }

  async function replaceImagesInFile (path, route) {
    return await fs.readFile(path, 'utf8', async (err, data) => {
      const cleanPath = path.split('\\').pop()
      if (err) {
        return consola.error(err)
      }
      const payload = data.split('\\u002F').join('/')
      const urls = getImageUrls(payload)
      if (!urls.length) {
        return Promise.resolve()
      }
      if (options.verbose) {
        consola.info(`${route}: ${consoleTitle} replacing ${urls.length} images with local copies (${cleanPath})`)
      }
      let replaced = replaceRemoteImages(payload, urls)
      if (!replaced) {
        return
      }
      replaced = replaced.split('/').join('\\u002F')
      return await fs.writeFile(path, replaced, (err) => {
        if (err) {
          consola.error(err)
        }
      })
    })
  }

  async function saveRemoteImages () {
    const imageList = images.filter(
      (img, i) => images.findIndex(u => u.url === img.url) === i
    )
    const total = imageList.length
    consola.info(`${consoleTitle} ${chalk.bold(total)} unique remote images found, saving local copies`)
    progressBar = new ProgressBar(
      chalk.hex('#74ffdc')('* Magpie') + ' :bar :current/:total images saved',
      {
        total,
        width: 20,
        complete: chalk.bgHex('#74ffdc')(' '),
        incomplete: ' ',
        clear: true
      }
    )
    // Start generate process
    while (imageList.length) {
      await Promise.all(
        imageList
          .splice(0, options.concurrency)
          .map(async (img) => {
            return await saveRemoteImage(img)
          })
      )
    }
    consola.info(`${consoleTitle} saved ${chalk.bold(total)} remote images`)
  }

  function saveRemoteImage ({ url, path }) {
    return axios({
      url,
      responseType: 'stream'
    })
      .then(
        response =>
          new Promise((resolve, reject) => {
            if (progressBar) {
              progressBar.tick()
            }
            return response.data
              .pipe(fs.createWriteStream(path))
              .on('finish', () => resolve())
              .on('error', e => reject(e))
          })
      )
      .catch((e) => {
        consola.error(`${chalk.hex('#74ffdc')('Magpie')} image fetch failed: ${url} (${e})`)
      })
  }

  // https://gist.github.com/codeguy/6684588
  function slugify (text) {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .trim()
      .replace('/', '')
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '-')
      .replace(/--+/g, '-')
  }
}

module.exports.meta = require('../package.json')
