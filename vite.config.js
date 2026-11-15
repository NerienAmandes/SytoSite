import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base — абсолютный путь от корня домена.
// Относительные пути ('./') ломают вложенные страницы SPA на Apache (sweb.ru):
// на /cart браузер искал бы /cart/assets/index.js и получил бы 404.
// Если сайт лежит в подпапке (например /shop/), задайте SITE_BASE_PATH=/shop/ при сборке.
export default defineConfig({
  plugins: [react()],
  base: process.env.SITE_BASE_PATH || '/',
})
