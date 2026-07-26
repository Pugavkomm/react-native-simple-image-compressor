const path = require('path');
const { getConfig } = require('react-native-builder-bob/babel-config');
const pkg = require('../package.json');

const root = path.resolve(__dirname, '..');

module.exports = getConfig(
  {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@shared': './src/shared',
            '@entities': './src/entities',
            '@features': './src/features',
            '@widgets': './src/widgets',
            '@pages': './src/pages',
            '@app': './src/app',
          },
        },
      ],
    ],
  },
  { root, pkg }
);
