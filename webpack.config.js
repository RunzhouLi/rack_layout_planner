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
    host: "0.0.0.0",          // 监听所有网卡
    port: 3000,               // 端口
    allowedHosts: 'all',      // 允许任意主机名访问
    open: false,              // 不自动打开浏览器（服务器环境）
    hot: true,                // 开启 HMR
    liveReload: true,         // 启用 liveReload
    client: {
      webSocketURL: {
//        hostname: '68.183.38.50',  // 你的公网 IP
        port: 3000,
        protocol: 'ws'
      }
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
