// Скрипт пакетной конвертации изображений в WebP.
// Берёт все *.png, *.jpg, *.jpeg из public/images/
// Конвертирует в *.webp рядом (оригиналы не удаляет — на случай отката).
// Параметры подобраны под каталог: q=80, max-width=1200px.
// Использование:  node scripts/convert-to-webp.mjs

import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DIR = path.join(__dirname, '..', 'public', 'images')
const QUALITY = 80          // качество WebP (0–100)
const MAX_WIDTH = 1200      // ограничение по ширине (для карточек товара этого хватает)
const SKIP_IF_NEWER = true  // пропускать, если .webp уже свежее исходника

const exts = ['.png', '.jpg', '.jpeg']
const files = fs
  .readdirSync(DIR)
  .filter(f => exts.includes(path.extname(f).toLowerCase()))

if (files.length === 0) {
  console.log('Не нашёл png/jpg в', DIR)
  process.exit(0)
}

console.log(`Найдено ${files.length} файлов. Конвертирую в WebP (q=${QUALITY}, max-width=${MAX_WIDTH}px)…\n`)

let totalBefore = 0
let totalAfter = 0

for (const file of files) {
  const src = path.join(DIR, file)
  const dst = path.join(DIR, file.replace(/\.(png|jpg|jpeg)$/i, '.webp'))

  if (SKIP_IF_NEWER && fs.existsSync(dst)) {
    const srcStat = fs.statSync(src)
    const dstStat = fs.statSync(dst)
    if (dstStat.mtimeMs >= srcStat.mtimeMs) {
      const kb = (dstStat.size / 1024).toFixed(1)
      console.log(`  ⏭  ${file} → ${path.basename(dst)} (уже сконвертирован, ${kb} KB)`)
      totalAfter += dstStat.size
      continue
    }
  }

  const before = fs.statSync(src).size
  totalBefore += before

  try {
    await sharp(src)
      .rotate() // учитывать EXIF-ориентацию (на всякий случай)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 4 })
      .toFile(dst)

    const after = fs.statSync(dst).size
    totalAfter += after
    const saved = ((1 - after / before) * 100).toFixed(0)
    console.log(
      `  ✓ ${file.padEnd(20)} → ${path.basename(dst).padEnd(24)} ` +
      `${(before / 1024).toFixed(0).padStart(4)} KB → ${(after / 1024).toFixed(0).padStart(4)} KB  (-${saved}%)`
    )
  } catch (err) {
    console.error(`  ✗ ${file}: ${err.message}`)
  }
}

console.log(
  `\nИтого: ${(totalBefore / 1024).toFixed(0)} KB → ${(totalAfter / 1024).toFixed(0)} KB ` +
  `(-${((1 - totalAfter / totalBefore) * 100).toFixed(0)}%)`
)
console.log('Оригиналы НЕ удалены. Удалите вручную, если webp-версии устраивают.')
