# nuxt-magpie

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions CI][github-actions-ci-src]][github-actions-ci-href]
[![Codecov][codecov-src]][codecov-href]
[![License][license-src]][license-href]

> Build module for [Nuxt.js](https://github.com/nuxt/nuxt.js) to download remote images and include them as local files in the generated build when performing [full static generation](https://nuxtjs.org/blog/going-full-static/).

[📖 **Release Notes**](./CHANGELOG.md)

✨🐦 Shiny!

Magpie aims to take Nuxt's [full static generation](https://nuxtjs.org/blog/going-full-static/) a step further, to create a standalone build with no API calls and no remote image assets.

## Features

- Downloads local copies of all remote images to your `/dist` folder
- For each generated route, replaces all image urls in the page's html and payload/state to use the local copies
- Use it with a locally hosted CMS to create a build ready to be deployed on static hosts (e.g. Netlify)
- Requires `nuxt` version >= `2.14.0`

## Before starting

In its current version, even with full static generation enabled, nuxt still runs the `fetch` and `asyncData` calls when navigating to another route (as documented [here](https://nuxtjs.org/blog/going-full-static#current-issues)). To prevent these calls from overriding the urls replaced by magpie, you can add a check in your `fetch` or `asyncData` to bail fetching if the requested data is already available or `process.static` is `true`.

## Setup

1. Add `nuxt-magpie` dependency to your project

```bash
yarn add nuxt-magpie # or npm install nuxt-magpie
```

2. Add `nuxt-magpie` to the `buildModules` section of `nuxt.config.js`

```js
{
  buildModules: [
    // Simple usage
    "nuxt-magpie",

    // With options
    [
      "nuxt-magpie",
      {
        /* module options */
      }
    ]
  ];
}
```

3. Enable `full static` generation in `nuxt.config.js`:

```js
{
  ssr: true,
  target: 'static'
}
```

4. Run `nuxt generate`

## Options

All options and their default values: 
```js
{
  path: '/_images', // dir inside /dist where downloaded images will be saved
  extensions: ['jpg', 'jpeg', 'gif', 'png', 'webp'],
  baseUrl: '', // only download images from a certain url (e.g. your backend url)
  verbose: false, // show additional log info
  concurrency: 10, // max concurrent image downloads
  keepFolderStructure: false, // re-creates original image paths when saving local copies
  alias: null // see below for details
}
```

### Alias

You can provide aliases to be replaced before image lookup.
For example, Strapi doesn't return the full image urls when using the default upload provider, but instead uses the format `/uploads/image-name`.

You can use the `alias` option to make sure all image paths are parsed correctly:

```js
{
  /* ... Magpie options */
  alias: {
    '/uploads': 'http://localhost:1337/uploads'
  }
}

```

## Development

1. Clone this repository
2. Install dependencies using `yarn install` or `npm install`
3. Start development server using `npm run dev`

## License

[MIT License](./LICENSE)

Copyright (c) Emilio Bondioli

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/nuxt-magpie/latest.svg
[npm-version-href]: https://npmjs.com/package/nuxt-magpie
[npm-downloads-src]: https://img.shields.io/npm/dt/nuxt-magpie.svg
[npm-downloads-href]: https://npmjs.com/package/nuxt-magpie
[github-actions-ci-src]: https://github.com/emiliobondioli/nuxt-magpie/workflows/ci/badge.svg
[github-actions-ci-href]: https://github.com/emiliobondioli/nuxt-magpie/actions?query=workflow%3Aci
[codecov-src]: https://img.shields.io/codecov/c/github/emiliobondioli/nuxt-magpie.svg
[codecov-href]: https://codecov.io/gh/emiliobondioli/nuxt-magpie
[license-src]: https://img.shields.io/npm/l/nuxt-magpie.svg
[license-href]: https://npmjs.com/package/nuxt-magpie
