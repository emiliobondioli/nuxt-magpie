const fs = require('fs')
// eslint-disable-next-line no-unused-vars
const http = require('http')
const https = require('https')
const Stream = require('stream').Transform
const { URL } = require('url')
const { join, dirname, extname } = require('path')
const consola = require('consola')
const chalk = require('chalk')
const ProgressBar = require('progress')
const { isFullStatic } = require('@nuxt/utils')

const defaults = {
  path: '/_images',
  extensions: ['jpg', 'jpeg', 'gif', 'png', 'webp'],
  baseUrl: '',
  verbose: false,
  concurrency: 10,
  keepFolderStructure: false,
  alias: null,
  replaceInChunks: true
}
const consoleTitle = chalk.hex('#74ffdc')('Magpie')

module.exports = function (moduleOptions) {
  if (!isFullStatic(this.options)) {
    consola.info(
      `${consoleTitle} ${chalk.bold(
        'Full static generation'
      )} is disabled, bailing image replacement`
    )
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

  this.nuxt.hook('generate:done', async () => {
    const baseBuildPath = join(
      this.options.generate.dir,
      this.options.build.publicPath
    )
    if(options.replaceInChunks) await replaceImagesInChunks(baseBuildPath);
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
      promises.push(replaceImagesInFile(payloadPath, true))
    }
    if (fs.existsSync(statePath)) {
      promises.push(replaceImagesInFile(statePath, true))
    }
    return await Promise.all(promises)
  })

  this.nuxt.hook('generate:page', ({ page, errors }) => {
    page.html = replaceImagesInString(page.html)
  })

  function replaceImagesInString (string) {
    if (options.alias) {
      string = replacePathAliases(string)
    }
    const urls = getImageUrls(string)
    if (!urls.length) {
      return string
    }
    return replaceRemoteImages(string, urls)
  }

  async function replaceImagesInChunks(path) {
    const files = await readDirContents(path)
    return await Promise.all(files.map(async (file) => {
      const filePath = join(path, file)
      if(extname(filePath) !== '.js') return
      return await replaceImagesInFile(filePath, false)
    }));
  }

  async function readDirContents(path) {
    return new Promise((resolve, reject) => {
      fs.readdir(path, (err, files) => {
        if(err) return reject(err)
        resolve(files)
      })
    })
  }

  async function replaceImagesInFile (path, encoded = true) {
    return await fs.readFile(path, 'utf8', async (err, data) => {
      if (err) {
        return consola.error(err)
      }
      let payload = data
      if(encoded) payload = data.split('\\u002F').join('/')
      let replaced = replaceImagesInString(payload)
      if (!replaced) {
        return
      }
      if(encoded) replaced = replaced.split('/').join('\\u002F')
      return await fs.writeFile(path, replaced, (err) => {
        if (err) {
          consola.error(err)
        }
      })
    })
  }

  function getImageUrls (string) {
    const urls = []
    const test = new RegExp(
      '(https?)(://.*?.)(?:' + options.extensions.join('|') + ')',
      'g'
    )
    const matches = string.matchAll(test)
    for (const match of matches) {
      let matchBaseUrl = true
      const url = new URL(match[0])
      if (options.baseUrl) {
        const baseUrl = new URL(options.baseUrl)
        matchBaseUrl = baseUrl.hostname === url.hostname
      }
      if (matchBaseUrl && !urls.find(u => u.href === url.href)) {
        urls.push(url)
      }
    }
    return urls
  }

  function replaceRemoteImages (html, urls) {
    urls = urls.forEach((url) => {
      const ext = '.' + url.pathname.split('.').pop()
      let name, imgPath
      if (options.keepFolderStructure) {
        name = url.pathname.split('/').pop()
        imgPath = join(baseDir, url.pathname)
      } else {
        name = slugify(url.pathname.split(ext).join('')) + ext
        imgPath = join(baseDir, name)
      }
      if (options.verbose) {
        consola.info(`${consoleTitle} saving ${url.href} (${imgPath})`)
      }
      const img = { url: url.href, path: imgPath, name }
      images.push(img)
      html = html.split(url.href).join(options.path + '/' + name)
    })
    return html
  }

  function replacePathAliases (string) {
    const replacements = []
    for (const path in options.alias) {
      const test = new RegExp(
        "[\"' \n]([" +
          path +
          '])+(/[A-z0-9]+.(' +
          options.extensions.join('|') +
          '))',
        'g'
      )
      const matches = string.matchAll(test)
      for (const match of matches) {
        replacements.push({
          original: match[0],
          replacement: match[0].split(path).join(options.alias[path])
        })
      }
    }
    replacements.forEach((r) => {
      string = string.split(r.original).join(r.replacement)
    })
    return string
  }

  async function saveRemoteImages () {
    const imageList = images.filter(
      (img, i) => images.findIndex(u => u.url === img.url) === i
    )
    const total = imageList.length
    consola.info(
      `${consoleTitle} ${chalk.bold(
        total
      )} unique remote images found, saving local copies`
    )
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

    while (imageList.length) {
      await Promise.all(
        imageList.splice(0, options.concurrency).map(async (img) => {
          return await saveRemoteImage(img)
        })
      )
    }
    consola.info(`${consoleTitle} saved ${chalk.bold(total)} remote images`)
  }

  async function saveRemoteImage ({ url, path }) {
    try {
      const data = await getRemoteImage(url)
      if (progressBar) {
        progressBar.tick()
      }
      const dir = dirname(path)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFile(path, data, (err) => {
        if (err) {
          consola.error(`${consoleTitle} error while saving image: ${err}`)
        }
      })
    } catch (e) {
      consola.error(`${consoleTitle} image fetch failed: ${url} (${e})`)
    }
  }

  function getRemoteImage (href) {
    const url = new URL(href)
    let agent = http
    if (url && url.protocol.includes('https')) {
      agent = https
    }
    return new Promise((resolve, reject) => {
      agent
        .request(href, (response) => {
          const data = new Stream()
          response.on('data', (chunk) => {
            data.push(chunk)
          })
          response.on('error', (e) => {
            reject(e)
          })
          response.on('end', () => {
            resolve(data.read())
          })
        })
        .end()
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
