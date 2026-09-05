// Разовое обновление products.json + categories.json:
//   1) Проставляет image-пути тем товарам, у которых они null.
//   2) Для 7 товаров — есть свой файл в public/images/.
//   3) Для 3 напитков без своего файла — ближайший «тезка» (siten / СЫТА).
//   4) Для всех остальных товаров категории «мёд» без своего файла —
//      myod.webp как явная заглушка (помечена полем imageNote).
//
// Использование: node scripts/wire-images.mjs

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.join(__dirname, '..')

// slug -> { image, imageNote? }
const PRODUCT_MAP = {
  // Напитки: готовые файлы
  'olus-arzamasskiy-gus':                 { image: '/images/arzamasgus.webp' },
  'chay-iz-kipreya-fermentirovannyy':     { image: '/images/kipreichaiferment.webp' },
  'chay-iz-kipreya-yagodnyy':             { image: '/images/kiprejsmalinoy.webp' },
  'uzvar-ray-yablochki-cheremukha':       { image: '/images/uzvarnoldvapuat.webp' },
  'kvas-medvyanoj':                       { image: '/images/kvas.webp' },

  // Напитки: ближайший «тезка» как заглушка
  'syto-na-berezovom-soke':               { image: '/images/siten.webp',   imageNote: 'заглушка = siten.webp' },
  'surya-yablochno-medovaya':             { image: '/images/siten.webp',   imageNote: 'заглушка = siten.webp' },
  'nabor-podarochnyy-syto':               { image: '/images/СЫТА.webp',   imageNote: 'заглушка = СЫТА.webp' },

  // Мёд: готовые файлы
  'myod-lipovyy':                         { image: '/images/myod.webp' },
  'vytyazhka-ognevki':                    { image: '/images/ognevka.webp' },

  // Мёд: все остальные позиции — общая заглушка myod.webp
  'myod-lesnoy-sbor':                     { image: '/images/myod.webp', imageNote: 'заглушка' },
  'myod-lugovoe-raznotravye':             { image: '/images/myod.webp', imageNote: 'заглушка' },
  'myod-s-trutnevym-gomogenatom':         { image: '/images/myod.webp', imageNote: 'заглушка' },
  'myod-zhguchiy':                        { image: '/images/myod.webp', imageNote: 'заглушка' },
  'myod-zolotoy-oreshek':                 { image: '/images/myod.webp', imageNote: 'заглушка' },
  'pyltsa-lugovogo-raznotravya':          { image: '/images/myod.webp', imageNote: 'заглушка' },
  'pyltsa-v-medu':                        { image: '/images/myod.webp', imageNote: 'заглушка' },
  'krem-myod-s-propolisom':               { image: '/images/myod.webp', imageNote: 'заглушка' },
  'perga-v-medu':                         { image: '/images/myod.webp', imageNote: 'заглушка' },
  'myod-v-sotakh':                        { image: '/images/myod.webp', imageNote: 'заглушка' },
  'vytyazhka-propolisa':                  { image: '/images/myod.webp', imageNote: 'заглушка' },
  'vosk-naturalnyy':                      { image: '/images/myod.webp', imageNote: 'заглушка' },
}

// 1. products.json
const productsPath = path.join(ROOT, 'src', 'data', 'products.json')
const productsJson = JSON.parse(fs.readFileSync(productsPath, 'utf8'))
const products = productsJson.products || productsJson

let pUpdated = 0
let pSkipped = 0
for (const p of products) {
  const m = PRODUCT_MAP[p.slug]
  if (!m) continue
  if (p.image && p.image !== null) {
    pSkipped += 1
    continue
  }
  p.image = m.image
  if (m.imageNote) p.imageNote = m.imageNote
  pUpdated += 1
}

fs.writeFileSync(productsPath, JSON.stringify(productsJson, null, 2) + '\n', 'utf8')
console.log(`products.json: обновлено ${pUpdated}, пропущено (уже было) ${pSkipped}`)

// 2. categories.json — добавить image для категории myod
const catsPath = path.join(ROOT, 'src', 'data', 'categories.json')
const catsJson = JSON.parse(fs.readFileSync(catsPath, 'utf8'))
const cats = catsJson.categories || catsJson

let cUpdated = 0
for (const c of cats) {
  if (c.id === 'myod' && !c.image) {
    c.image = '/images/myod.webp'
    cUpdated += 1
  }
}

fs.writeFileSync(catsPath, JSON.stringify(catsJson, null, 2) + '\n', 'utf8')
console.log(`categories.json: обновлено ${cUpdated}`)

// 3. Контроль: список товаров, у которых image всё ещё null
const stillNull = products.filter(p => p.image == null).map(p => p.slug)
if (stillNull.length) {
  console.log('\nОстались без image:')
  for (const s of stillNull) console.log('  -', s)
} else {
  console.log('\nВсе товары имеют image ✓')
}
