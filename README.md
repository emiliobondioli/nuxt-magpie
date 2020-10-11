# magpie

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions CI][github-actions-ci-src]][github-actions-ci-href]
[![Codecov][codecov-src]][codecov-href]
[![License][license-src]][license-href]

> During full static generation, download all remote images and add them to the dist folder, replacing file names in html and static payloads

[📖 **Release Notes**](./CHANGELOG.md)

## Setup

1. Add `magpie` dependency to your project

```bash
yarn add magpie # or npm install magpie
```

2. Add `magpie` to the `modules` section of `nuxt.config.js`

```js
{
  modules: [
    // Simple usage
    'magpie',

    // With options
    ['magpie', { /* module options */ }]
  ]
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
[npm-version-src]: https://img.shields.io/npm/v/magpie/latest.svg
[npm-version-href]: https://npmjs.com/package/magpie

[npm-downloads-src]: https://img.shields.io/npm/dt/magpie.svg
[npm-downloads-href]: https://npmjs.com/package/magpie

[github-actions-ci-src]: https://github.com/emiliobondioli/workflows/ci/badge.svg
[github-actions-ci-href]: https://github.com/emiliobondioli/actions?query=workflow%3Aci

[codecov-src]: https://img.shields.io/codecov/c/github/emiliobondioli.svg
[codecov-href]: https://codecov.io/gh/emiliobondioli

[license-src]: https://img.shields.io/npm/l/magpie.svg
[license-href]: https://npmjs.com/package/magpie
