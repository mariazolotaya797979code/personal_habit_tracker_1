import { cpSync, mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const dest = 'release'
if (!existsSync('dist/index.html')) {
  console.error('Сначала соберите приложение: npm run build')
  process.exit(1)
}
mkdirSync(dest, { recursive: true })
cpSync('dist', dest, { recursive: true })
for (const file of ['start.bat', 'start.ps1', 'start.sh', 'ИНСТРУКЦИЯ.md', 'README.md']) {
  if (existsSync(file)) cpSync(file, join(dest, file))
}
writeFileSync(join(dest, 'Вершина.url'), [
  '[InternetShortcut]',
  'URL=http://127.0.0.1:8765/',
  'IconFile=icons/icon-512.png',
  'IconIndex=0',
  '',
].join('\r\n'))
console.log('Пакет для передачи готов в папке release/')
