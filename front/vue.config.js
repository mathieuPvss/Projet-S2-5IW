const { defineConfig } = require('@vue/cli-service')
module.exports = {
  configureWebpack: {
    resolve: {
      fallback: {
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "util": require.resolve("util/"),
        "stream": require.resolve("stream-browserify"),
        "crypto": require.resolve("crypto-browserify"),
        "zlib": require.resolve("browserify-zlib"),
        "url": require.resolve("url/")
      }
    }
  }
};