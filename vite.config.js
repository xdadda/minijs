import { defineConfig } from 'vite'
import { minifyTemplateLiterals } from "rollup-plugin-minify-template-literals";

import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig(({isSsrBuild, mode})=>{

return {
    plugins: [
        {...minifyTemplateLiterals(),apply:'build'}
      ],
    build: {
      target: 'esnext',
      minify: true, //in production to reduce size
      sourcemap: false, //unless required during development to debug production code artifacts
      modulePreload: { polyfill: false }, //not needed for modern browsers
      cssCodeSplit:false, //if small enough it's better to have it in one file to avoid flickering during suspend
      copyPublicDir: isSsrBuild?false:true,
      lib: {
        entry: {
          mini:resolve(__dirname, 'src/index.js'),
          store:resolve(__dirname, 'src/store/index.js'),
          router:resolve(__dirname, 'src/router/index.js'),
          components:resolve(__dirname, 'src/components/index.js'),
        },
        name: 'MiNi',
      }, 
      rollupOptions: {
        // make sure to externalize deps that shouldn't be bundled
        // into your library
        external: ['mini','mini/store'],
      }
    }
  }
})
