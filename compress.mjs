// Kompres foto undangan ke WebP.
// Cara pakai (jalankan di folder undangan, sejajar dengan folder assets):
//   npm i sharp
//   node compress.mjs
// Hasil: assets/img/webp/1.webp ... 20.webp (foto asli tidak diubah)

import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "assets/img";
const OUT = "assets/img/webp";
const EXT = "JPG";                    // sesuaikan jika ekstensi foto asli berbeda
const HERO = new Set([13, 16, 19, 18, 15]);   // foto layar penuh: lebih besar
await mkdir(OUT, { recursive: true });

for (let n = 1; n <= 20; n++) {
    const width = HERO.has(n) ? 1600 : 1100;
    try {
        const info = await sharp(`${SRC}/${n}.${EXT}`)
            .rotate()                                  // ikuti orientasi EXIF
            .resize({ width, withoutEnlargement: true })
            .webp({ quality: HERO.has(n) ? 80 : 74 })
            .toFile(`${OUT}/${n}.webp`);
        console.log(`${n}.${EXT} -> ${n}.webp  ${(info.size / 1024).toFixed(0)} KB`);
    } catch (e) {
        console.log(`${n}: dilewati (${e.message})`);
    }
}
