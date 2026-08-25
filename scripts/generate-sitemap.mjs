/**
 * Генератор sitemap.xml на основе списка товаров и статических маршрутов.
 * Запускается перед `npm run build` (см. скрипт `prebuild` в package.json).
 *
 * Читает:
 *   - src/data/products.json  — массив товаров с полем slug
 *   - SITE_BASE                — базовый URL из .env или дефолт https://syto.ru
 *
 * Пишет:
 *   - public/sitemap.xml       — карта сайта в формате XML
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const root = resolve(__dirname, '..')

/* Базовый URL — из переменной окружения SITE_BASE, иначе дефолт */
const SITE = (process.env.SITE_BASE || 'https://syto.ru').replace(/\/$/, '')

/* Статические маршруты приложения (соответствуют src/App.jsx) */
const STATIC_ROUTES = [
  { loc: '/',                                  changefreq: 'weekly',  priority: '1.0' },
  { loc: '/syto',                              changefreq: 'monthly', priority: '0.9' },
  { loc: '/catalog',                           changefreq: 'weekly',  priority: '0.9' },
  { loc: '/catalog/napitki',                   changefreq: 'weekly',  priority: '0.8' },
  { loc: '/catalog/myod',                      changefreq: 'weekly',  priority: '0.8' },
  { loc: '/catalog/myasnye-delikatesy',        changefreq: 'weekly',  priority: '0.8' },
  { loc: '/catalog/gidrolaty',                 changefreq: 'weekly',  priority: '0.8' },
  { loc: '/o-ferme',                           changefreq: 'monthly', priority: '0.7' },
  { loc: '/dostavka-i-oplata',                 changefreq: 'monthly', priority: '0.6' },
  { loc: '/optovikam',                         changefreq: 'monthly', priority: '0.7' },
  { loc: '/kontakty',                          changefreq: 'yearly',  priority: '0.6' },
]

/* Динамические маршруты — берём slug'и товаров */
function readProductSlugs() {
  const path = resolve(root, 'src/data/products.json')
  if (!existsSync(path)) return []
  const json = JSON.parse(readFileSync(path, 'utf8'))
  return (json.products || [])
    .filter((p) => p.slug)
    .map((p) => ({
      loc: `/product/${p.slug}`,
      changefreq: 'monthly',
      priority: '0.7',
    }))
}

function xmlEscape(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
  }[c]))
}

function urlEntry({ loc, changefreq, priority }) {
  return [
    '  <url>',
    `    <loc>${xmlEscape(SITE + loc)}</loc>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n')
}

function buildSitemap() {
  const all = [...STATIC_ROUTES, ...readProductSlugs()]
  const body = all.map(urlEntry).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`
}

const out = resolve(root, 'public/sitemap.xml')
writeFileSync(out, buildSitemap(), 'utf8')
console.log(`[sitemap] Сгенерирован ${out} (${STATIC_ROUTES.length + readProductSlugs().length} URL)`)
