const fs = require('fs')
const path = require('path')
const dir = path.join(__dirname, '..', 'public', 'images')
const files = fs.readdirSync(dir).filter(f => /\.(png|jpg|jpeg)$/i.test(f))
console.log('Файл | Размер (KB)')
console.log('---|---')
for (const f of files) {
  const stat = fs.statSync(path.join(dir, f))
  console.log(`${f} | ${(stat.size/1024).toFixed(1)}`)
}
console.log('Всего:', files.length, 'файлов')
