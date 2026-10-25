import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The site lives at https://bgs3jc.github.io/christmas-list/, so every asset
// path needs the /christmas-list/ prefix.
export default defineConfig({
  base: '/christmas-list/',
  plugins: [react()],
})
