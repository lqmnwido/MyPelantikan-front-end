const webpack = require('webpack');
module.exports = {
  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false
    }
  },
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        __VUE_OPTIONS_API__: JSON.stringify(true),
        __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false)
      })
    ],
    
    ignoreWarnings: [
      {
        module: /@wangeditor/,
        message: /export 'default' \(imported as 't'\) was not found in 'vue'/
      }
    ],
    
  },
  transpileDependencies: [
    '@toast-ui/vue-editor'
  ],
}
