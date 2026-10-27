import sharp from 'sharp'
import { mkdirSync, existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const bgDir = join('public', 'bg')
const iconDir = join('public', 'icons')
mkdirSync(bgDir, { recursive: true })
mkdirSync(iconDir, { recursive: true })

for (const d of days) {
  const file = join('scripts', `bg-${d}.jpg`)
  if (!existsSync(file)) continue
  await sharp(file).resize({ width: 1920, kernel: 'lanczos3' }).webp({ quality: 82 }).toFile(join(bgDir, `${d}.webp`))
  await sharp(file).resize({ width: 48 }).blur(2).webp({ quality: 50 }).toFile(join(bgDir, `${d}-tiny.webp`))
}

const favicon = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="sky" cx="50%" cy="28%" r="80%">
      <stop offset="0" stop-color="#7ec8ff"/>
      <stop offset=".45" stop-color="#1d4f9a"/>
      <stop offset="1" stop-color="#071428"/>
    </radialGradient>
    <radialGradient id="sun" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#fff4b8"/>
      <stop offset=".4" stop-color="#ffc53d"/>
      <stop offset="1" stop-color="#e07a00"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#sky)"/>
  <circle cx="256" cy="196" r="92" fill="url(#sun)"/>
  <path d="M0 430 L90 320 L150 372 L256 210 L360 350 L420 300 L512 430 V512 H0 Z" fill="#071018"/>
  <g fill="#061018" transform="translate(256 248)">
    <circle cy="-62" r="16"/>
    <path d="M-8 -48 h16 v38 l22 34 h-16 l-14 -24 -14 24 h-16 l22 -34 z"/>
    <path d="M8 -36 l34 -28 10 12 -34 28z"/>
    <path d="M-8 -28 l-8 36 -14 -4 12 -40z"/>
  </g>
</svg>`

const iconSrc = join('scripts', 'app-icon.jpg')
if (existsSync(iconSrc)) {
  const rounded = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" rx="112" fill="#000"/></svg>`,
  )
  const square = await sharp(iconSrc).resize(512, 512, { fit: 'cover', position: 'centre' }).png().toBuffer()
  await sharp(square).resize(192).png().toFile(join(iconDir, 'icon-192.png'))
  await sharp(square).png().toFile(join(iconDir, 'icon-512.png'))
  await sharp(square).resize(180).png().toFile(join(iconDir, 'apple-touch-icon.png'))
  await sharp(square)
    .composite([{ input: rounded, blend: 'dest-in' }])
    .png()
    .toFile(join(iconDir, 'maskable-512.png'))
}

writeFileSync(join('public', 'favicon.svg'), favicon)
console.log('assets ready')
