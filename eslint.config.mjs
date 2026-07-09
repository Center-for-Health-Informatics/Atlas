import neostandard from 'neostandard'
import globals from 'globals'

export default [
  {
    ignores: ['js/assets/**', 'js/assets/bundle/**', 'js/extensions/plugins/css.min.js'],
  },
  ...neostandard(),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        define: 'readonly',
        requirejs: 'readonly',
      },
    },
  },
]
