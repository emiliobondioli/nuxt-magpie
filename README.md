# nuxt-magpie

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions CI][github-actions-ci-src]][github-actions-ci-href]
[![Codecov][codecov-src]][codecov-href]
[![License][license-src]][license-href]

> Build module for [Nuxt.js](https://github.com/nuxt/nuxt.js) to download remote images and include them as local files in the generated build when performing [full static generation](https://nuxtjs.org/blog/going-full-static/)

[📖 **Release Notes**](./CHANGELOG.md)

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
    'nuxt-magpie',

    // With options
    ['nuxt-magpie', {
      path: '/_images', // dir where downloaded images will be stored
      extensions: ['jpg', 'jpeg', 'gif', 'png', 'webp'],
      baseUrl: '', // only download images from a certain url (e.g. your backend url)
      verbose: false, // shows additional log info
      concurrency: 10 // max concurrent image downloads
    }]
  ]
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

[github-actions-ci-src]: https://github.com/emiliobondioli/workflows/ci/badge.svg
[github-actions-ci-href]: https://github.com/emiliobondioli/actions?query=workflow%3Aci

[codecov-src]: https://img.shields.io/codecov/c/github/emiliobondioli.svg
[codecov-href]: https://codecov.io/gh/emiliobondioli

[license-src]: https://img.shields.io/npm/l/nuxt-magpie.svg
[license-href]: https://npmjs.com/package/nuxt-magpie
