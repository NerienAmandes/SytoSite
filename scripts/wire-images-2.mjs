// Обновляет 4 карточки + добавляет новую «Сыта 0,5л пластик».
//   siria       -> surya-yablochno-medovaya
//   mnogasit    -> nabor-podarochnyy-syto
//   sitokakoeto -> syto-na-berezovom-soke
//   sirovyalen  -> perepelka-syrovyalenaya
//   sitaplastik -> новый товар syta-0-5-plastik
//
// Запуск: node scripts/wire-images-2.mjs

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.join(__dirname, '..')

const productsPath = path.join(ROOT, 'src', 'data', 'products.json')
const data = JSON.parse(fs.readFileSync(productsPath, 'utf8'))
const products = data.products || data

// 1) Подстановка / замена для существующих товаров
const SWAPS = {
  'surya-yablochno-medovaya':   '/images/siria.webp',
  'nabor-podarochnyy-syto':     '/images/mnogasit.webp',
  'syto-na-berezovom-soke':     '/images/sitokakoeto.webp',
  'perepelka-syrovyalenaya':    '/images/sirovyalen.webp',
}

let updated = 0
for (const p of products) {
  if (SWAPS[p.slug]) {
    p.image = SWAPS[p.slug]
    delete p.imageNote
    updated += 1
  }
}

// 2) Новый товар «Сыта 0,5л пластик» — отдельная SKU от стекла
if (!products.some(p => p.slug === 'syta-0-5-plastik')) {
  products.push({
    slug: 'syta-0-5-plastik',
    category: 'napitki',
    title: 'Сыта 0,5л пластик',
    shortDescription: 'Лёгкий безалкогольный напиток на медовом сусле, 0,5 л в пластиковой таре.',
    description: 'Сыта в удобной пластиковой таре 0,5 л — для пикника, в дорогу и на каждый день. Классический медовый вкус с лёгкой хмелевой горчинкой и травяным послевкусием.',
    image: '/images/sitaplastik.webp',
    available: true,
    tags: ['напиток', 'сыта', 'безалкогольный', 'пластик', '0,5 л'],
    pricePer: 'бут.',
    variants: [
      { label: '0,5 л, пластик', price: 250 },
    ],
  })
  updated += 1
}

fs.writeFileSync(productsPath, JSON.stringify(data, null, 2) + '\n', 'utf8')
console.log(`products.json: обновлено ${updated}, всего товаров ${products.length}`)

// Контроль
for (const slug of Object.keys(SWAPS)) {
  const p = products.find(x => x.slug === slug)
  console.log(`  ${slug.padEnd(32)} -> ${p ? p.image : 'НЕ НАЙДЕН'}`)
}
const n = products.find(x => x.slug === 'syta-0-5-plastik')
console.log(`  syta-0-5-plastik            -> ${n ? n.image : 'НЕ ДОБАВЛЕН'}`)
