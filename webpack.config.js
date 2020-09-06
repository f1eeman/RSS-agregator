const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// import path from 'path';
// import HtmlWebpackPlugin from 'html-webpack-plugin';

module.exports = {
  entry: './src/index.js',
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.js$/, use: 'babel-loader' },
    ],
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new HtmlWebpackPlugin(),
  ],
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
};
