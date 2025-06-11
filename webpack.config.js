const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './index.js',
  mode: 'development',
  devtool: 'source-map',  // external source maps for debugging original files
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  devServer: {
    static: [
      {
        directory: path.join(__dirname, 'dist'),
      },
      {
        directory: __dirname,
        publicPath: '/',
        serveIndex: false,
      }
    ],
    host: 'localhost', // Ensure HMR client uses localhost instead of 0.0.0.0
    port: 3000,
    open: true,
    hot: false,              // disable HMR to avoid eval in runtime
    liveReload: true,
    client: {
      webSocketURL: 'ws://localhost:3000/ws', // override default ws address
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|glb|hdr)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
  ],
  resolve: {
    extensions: ['.js'],
  },
};
