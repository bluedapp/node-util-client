module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-min-length': [1, 'always', 10],
    'header-max-length': [2, 'always', 100],
  },
}
