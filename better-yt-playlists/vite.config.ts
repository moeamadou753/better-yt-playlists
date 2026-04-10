import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import babel from '@rolldown/plugin-babel'
import manifest from './manifest.json'

// https://vite.dev/config/
export default defineConfig({
  server: {
      cors: {
        origin: '*'
      }
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    crx({ manifest})
  ],
})
