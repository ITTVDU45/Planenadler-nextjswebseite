#!/usr/bin/env node
/**
 * Schreibt minimale Platzhalter-PNGs nach public/icons/,
 * damit das PWA-Manifest keine 404-Fehler wirft.
 * Icons später durch echte 192/512/maskable ersetzen.
 */
const fs = require('fs')
const path = require('path')

// Minimales 1x1 PNG (transparent)
const MINI_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
)

const dir = path.join(__dirname, '..', 'public', 'icons')
const files = [
  'icon-192.png',
  'icon-512.png',
  'icon-192-maskable.png',
  'icon-512-maskable.png',
  'apple-touch-icon.png',
]

if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

for (const name of files) {
  fs.writeFileSync(path.join(dir, name), MINI_PNG)
  console.log('Written:', name)
}
