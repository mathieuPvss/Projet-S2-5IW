import withNuxt from './.playground/.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    extends: [
      'eslint:recommended',
      'plugin:vue/vue3-recommended',
      '@nuxtjs/eslint-config-typescript',
      '@nuxtjs/eslint-config',
    ],
    rules: {
      'vue/multi-word-component-names': 'off',
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    },
  }
)
