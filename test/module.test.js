const { join } = require('path')
const fs = require('fs')
const { generate, loadConfig } = require('@nuxtjs/module-test-utils')

describe('module base config', () => {
  let nuxt, generator

  beforeAll(async () => {
    ({ nuxt, generator } = (await generate(loadConfig(__dirname, '../../example'))))
  }, 60000)

  afterAll(async () => {
    await nuxt.close()
  })

  test('images dir created', () => {
    const path = join(generator.distPath, '_images')
    expect(fs.existsSync(path)).toBeTruthy()
  })

  test('route html replaced', () => {
    const path = join(generator.distPath, 'index.html')
    const html = fs.readFileSync(path, 'utf8')
    expect(html).not.toContain('https://nuxtjs.org/logos/nuxt-icon.png')
  })

  test('route payload replaced', () => {
    const path = join(generator.staticAssetsDir, 'payload.js')
    if (!fs.existsSync(path)) { return Promise.resolve(true) }
    const payload = fs.readFileSync(path, 'utf8')
    expect(payload).not.toContain('https:\\u002F\\u002Fnuxtjs.org\\u002Flogos\\u002Fnuxt-icon.png')
  })

  test('route state replaced', () => {
    const path = join(generator.staticAssetsDir, 'state.js')
    if (!fs.existsSync(path)) { return Promise.resolve(true) }
    const state = fs.readFileSync(path, 'utf8')
    expect(state).not.toContain('https:\\u002F\\u002Fnuxtjs.org\\u002Flogos\\u002Fnuxt-icon.png')
  })

  test('remote image saved', () => {
    const path = join(generator.distPath, '_images', 'logos-nuxt-icon.png')
    expect(fs.existsSync(path)).toBeTruthy()
  })
})

describe('module keep folder structure', () => {
  let nuxt, generator

  beforeAll(async () => {
    const config = loadConfig(__dirname, '../../example')
    config.modules[0].options.keepFolderStructure = true;
    ({ nuxt, generator } = (await generate(config)))
  }, 60000)

  afterAll(async () => {
    await nuxt.close()
  })

  test('remote image folder structure created', () => {
    const path = join(generator.distPath, '_images', 'logos', 'nuxt-icon.png')
    expect(fs.existsSync(path)).toBeTruthy()
  })
})
