var webpack = require('webpack')
var merge = require('webpack-merge')
var HtmlWebpackPlugin = require('html-webpack-plugin')

var nodeEnv = process.env.NODE_ENV
var PATHS = {
  src: __dirname + '/src',
  dist: __dirname + '/dist'
};
var HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
  template: PATHS.src + '/index.html',
  filename: 'index.html',
  inject: 'body'
});

module.exports = {
  entry: [
    PATHS.src
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      {test: /\.css$/, loaders: ['style', 'css'], includes: [PATHS.src]},
      {test: /\.js|\.jsx/, exclude: /node_modules/, loader: 'babel'}
    ]
  },
  output: {
    filename: 'bundle.js',
    path: PATHS.dist
  },
  devServer: {
    hot: true,
    historyApiFallback: true,
    inline: true
  },
  plugins: [
    HTMLWebpackPluginConfig,
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(nodeEnv)
    })
  ]
};
