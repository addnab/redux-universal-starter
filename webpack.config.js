const path = require('path')
const webpack = require('webpack')

module.exports = env => {
  return {

    entry: env.dev ? {
      'index': [
        'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
        './app.js'
      ]
    } : [ './app.js' ],

    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/'
    },

    context: path.resolve(__dirname, 'src'),

    devtool: env.prod ? 'source-map' : 'eval',

    bail: env.prod,

    module: {
      loaders: [
        {
          test: /\.js$/,
          loader: 'babel',
          exclude: /node_modules/,
          query: {
            env: {
              development: {
                presets: [ 'react-hmre' ]
              }
            }
          }
        },
        { test: /\.css$/, loader: 'style!css' }
      ]
    },

    plugins: [
      new webpack.optimize.OccurrenceOrderPlugin(),
      ...env.dev ? [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
      ] : []
    ]
  }
}
