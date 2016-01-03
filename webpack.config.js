var webpack = require('webpack')

module.exports = {
  entry: {
    gauges: './gauges.js'
  },
  output: {
    path: 'dist',
    filename: '[name].js'
  },
  module: {
    loaders: [
      {test: /\.json$/, loader: 'json'}
    ]
  },
  plugins: [
  ]
}
