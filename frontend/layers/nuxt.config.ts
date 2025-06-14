export default defineNuxtConfig({
  extends: [
    './base',
    './app',
    './admin',
  ],
  dir:{
    public: './app/public',
    layouts: './layouts/',
  }
})
