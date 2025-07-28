import { defineConfig } from 'vite'
import path from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts({ insertTypesEntry: true })],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/CannonEsThreeJsTubes.ts'),
      name: 'CannonEsThreeJsTubes',
      formats: ['es', 'cjs'],
      fileName: "cannones-threejs-tubes",
    },
    rollupOptions: {
      external: ['three', 'cannon-es'],
      output: {
        globals: {
          three: 'THREE',
          'cannon-es': 'CANNON'
        }
      }
    }
  },
    server: {
    host: "0.0.0.0",
    port: 5173, 
  }
})
