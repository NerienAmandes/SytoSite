// Скрипт измерения ширины/высоты webp-файлов в public/images/.
// Используется, чтобы проставить width/height в <img> и избежать сдвигов макета.
// Использование:  node scripts/inspect-webp.mjs

import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DIR = path.join(__dirname, '..', 'public', 'images')

const files = fs.readdirSync(DIR).filter(f => f.toLowerCase().endsWith('.webp'))
files.sort()

console.log('Файл | width × height | aspect')
console.log('---|---|---')
for (const f of files) {
  const meta = await sharp(path.join(DIR, f)).metadata()
  const w = meta.width
  const h = meta.height
  const ratio = (w / h).toFixed(3)
  console.log(`${f} | ${w} × ${h} | ${ratio}`)
}
