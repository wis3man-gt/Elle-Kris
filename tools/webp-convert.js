#!/usr/bin/env node
/**
 * webp-convert.js
 * Converts PNG/JPEG images referenced in the site to WebP in-place.
 * Originals are kept as-is; WebP files are placed alongside them.
 *
 * Quality settings preserve visual fidelity:
 *   - JPEGs: quality 85, no lossless (photographic content)
 *   - PNGs with alpha: quality 90, lossless=false (sharp still preserves edges)
 *   - PNGs without alpha: quality 85, flatten to white
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMG_DIR = path.resolve(__dirname, '../assets/images');

// Files that need alpha preserved (transparency)
const ALPHA_KEEP = new Set(['teamBG.png', 'aboutBathroom1.png', 'aboutHome1.png', 'aboutKitchen1.png']);

// Only process files actually referenced in the site
const TARGETS = [
  'aboutBathroom1.png',
  'aboutHome1.png',
  'aboutKitchen1.png',
  'teamBG.png',
  'bathroomRenovation.jpeg',
  'flooringFinishes.jpeg',
  'homeRenovation.jpeg',
  'homeimprovements.jpeg',
  'kitchenRenovation.jpeg',
  'paintingDecoration.jpeg',
  'projects1.jpeg',
  'projects3.jpeg',
  'projectsSlider3.jpeg',
  'projectsSlider4.jpeg',
  'projectsSlider5.jpeg',
  'projectsSlider6.jpeg',
  'projectsSlider7.jpeg',
  'projectsSlider8.jpeg',
  'projectsSlider9.jpeg',
  'projectsSlider10.jpeg',
  'projectsSlider11.jpeg',
  'projectsSlider12.jpeg',
  'projectsSlider13.jpeg',
  'projectsSlider14.jpeg',
  'projectsSlider15.jpeg',
];

function kb(bytes) { return (bytes / 1024).toFixed(0) + ' KB'; }
function pct(before, after) { return Math.round((1 - after / before) * 100) + '%'; }

async function run() {
  let totalBefore = 0;
  let totalAfter = 0;

  console.log('\nConverting images → WebP\n');

  for (const filename of TARGETS) {
    const srcPath = path.join(IMG_DIR, filename);
    if (!fs.existsSync(srcPath)) {
      console.log(`  SKIP (not found): ${filename}`);
      continue;
    }

    const ext = path.extname(filename);
    const base = path.basename(filename, ext);
    const outPath = path.join(IMG_DIR, `${base}.webp`);

    const origSize = fs.statSync(srcPath).size;
    totalBefore += origSize;

    const isPng = ext.toLowerCase() === '.png';
    const keepAlpha = ALPHA_KEEP.has(filename);

    let pipeline = sharp(srcPath).withMetadata(false);

    if (isPng && keepAlpha) {
      // Preserve transparency, high quality
      await pipeline.webp({ quality: 90, effort: 5 }).toFile(outPath);
    } else if (isPng && !keepAlpha) {
      // Flatten transparent PNGs to white background
      await pipeline.flatten({ background: '#ffffff' }).webp({ quality: 85, effort: 5 }).toFile(outPath);
    } else {
      // JPEG → WebP, high quality
      await pipeline.webp({ quality: 85, effort: 5 }).toFile(outPath);
    }

    const newSize = fs.statSync(outPath).size;
    totalAfter += newSize;

    console.log(`  ${filename.padEnd(30)} ${kb(origSize).padStart(8)} → ${kb(newSize).padStart(8)}  (${pct(origSize, newSize)} saved)`);
  }

  console.log('\n' + '─'.repeat(60));
  console.log(`  Total: ${kb(totalBefore)} → ${kb(totalAfter)}  (${pct(totalBefore, totalAfter)} saved)`);
  console.log('\nDone. Update HTML src attributes to use .webp extensions.\n');
}

run().catch(err => { console.error(err); process.exit(1); });
