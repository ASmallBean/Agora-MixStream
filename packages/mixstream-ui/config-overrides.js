/*
 * @Author: yangliu
 * @Date: 2022-05-08 14:43:26
 * @LastEditTime: 2022-05-08 15:01:36
 * @LastEditors: yangliu
 */
const { override, addWebpackExternals, addWebpackPlugin, addWebpackResolve } = require('customize-cra');
const webpack = require('webpack');

const env = process.env.NODE_ENV || 'development';

const API_HOSTS = {
  // development: 'http://localhost:3030', // disable this line for using remote server
  development: 'http://mixstream-api.gz3.agoralab.co', // enable this line for using remote server
  production: 'https://mixstream-api.gz3.agoralab.co',
};

module.exports = override(
  (config) => {
    config.ignoreWarnings = [
      {
        module: /@netless\/window-manager/,
      },
    ];
    return config;
  },
  addWebpackExternals([
    {
      'agora-rdc-core': 'commonjs2 agora-rdc-core',
      'agora-electron-sdk': 'commonjs2 agora-electron-sdk',
      'electron': 'commonjs2 electron',
    },
  ]),
  addWebpackPlugin(
    new webpack.DefinePlugin({
      API_HOST: JSON.stringify(API_HOSTS[env]),
    }),
  ),
);
