// Kompres foto undangan ke WebP (2 ukuran: besar untuk laptop, kecil untuk HP).
// Jalankan di folder undangan:
//   npm i sharp
//   node compress.mjs
// Hasil: assets/img/webp/N.webp dan N-m.webp (foto asli tidak diubah)

import sharp from "sharp";
import { mkdir, access } from "node:fs/promises";

const SRC = "assets/img";
const OUT = "assets/img/webp";
const EXTS = ["jpg", "JPG", "jpeg", "JPEG", "png", "PNG"];   // otomatis cari ekstensi yang ada
const HERO = new Set([14, 10, 19, 18, 15]);                  // foto layar penuh
await mkdir(OUT, { recursive: true });

async function findFile(n) {
    for (const e of EXTS) {
        try { await access(`${SRC}/${n}.${e}`); return `${SRC}/${n}.${e}`; } catch {}
    }
    return null;
}

for (let n = 1; n <= 20; n++) {
    const file = await findFile(n);
    if (!file) { console.log(`${n}: file tidak ditemukan`); continue; }
    const bigW = HERO.has(n) ? 1600 : 1100;
    const q = HERO.has(n) ? 78 : 72;
    const big = await sharp(file).rotate().resize({ width: bigW, withoutEnlargement: true }).webp({ quality: q }).toFile(`${OUT}/${n}.webp`);
    const sm  = await sharp(file).rotate().resize({ width: 800,  withoutEnlargement: true }).webp({ quality: 70 }).toFile(`${OUT}/${n}-m.webp`);
    console.log(`${n}: besar ${(big.size / 1024).toFixed(0)} KB, HP ${(sm.size / 1024).toFixed(0)} KB`);
}
