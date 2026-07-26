import { defineConfig, mergeConfig } from 'vite';

import config from 'react-native-builder-bob/vite-config';
import pack from '../package.json' with { type: 'json' };

export default defineConfig((env) =>
  mergeConfig(config(env), {
    resolve: {
      alias: {
        [pack.name]: new URL('..', import.meta.url).pathname,
        '@shared': new URL('./src/shared', import.meta.url).pathname,
        '@entities': new URL('./src/entities', import.meta.url).pathname,
        '@features': new URL('./src/features', import.meta.url).pathname,
        '@widgets': new URL('./src/widgets', import.meta.url).pathname,
        '@pages': new URL('./src/pages', import.meta.url).pathname,
        '@app': new URL('./src/app', import.meta.url).pathname,
      },
      conditions: ['react-native-simple-image-compressor-source'],
      dedupe: Object.keys(pack.peerDependencies),
    },
  })
);
