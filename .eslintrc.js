module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module'
  },
  extends: ['@nuxtjs'],
  rules: {
    curly: 'off',
    'no-useless-escape': 'warn'
  }
}
