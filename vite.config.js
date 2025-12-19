import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: "/Design_Thinking1/",
  build: {
    outDir: "docs"
  }
})
