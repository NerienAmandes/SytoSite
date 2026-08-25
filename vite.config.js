import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' — относительные пути, чтобы статическая сборка
// корректно работала на любом подкаталоге Apache-хостинга (sweb.ru).
export default defineConfig({
  plugins: [react()],
  base: './',
})
