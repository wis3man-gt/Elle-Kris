#!/usr/bin/env node
/**
 * optimize-images.js
 * Production-grade image optimization pipeline using Sharp.
 *
 * Usage:
 *   node tools/optimize-images.js
 *   node tools/optimize-images.js --no-fallback   (skip JPEG fallbacks)
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// ─── Config ────────────────────────────────────────────────────────────────

const INPUT_DIR = path.resolve(__dirname, '../raw-images');
const OUTPUT_DIR = path.resolve(__dirname, '../assets/images');

const WIDTHS = [600, 1200, 1800]; // responsive breakpoints

const DEFAULT_WEBP = { quality: 70, effort: 6, lossless: false };
const ALPHA_WEBP   = { quality: 80, effort: 6, lossless: false }; // teamBG.png

const FALLBACK_JPEG = { quality: 80, mozjpeg: true };
const GENERATE_FALLBACK = !process.argv.includes('--no-fallback');

// Files that must keep alpha channel intact
const ALPHA_FILES = new Set(['teamBG.png']);

// Accepted extensions
const ACCEPTED = new Set(['.jpg', '.jpeg', '.png']);

// ─── Helpers ───────────────────────────────────────────────────────────────

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function bytesToKB(n) {
  return (n / 1024).toFixed(1);
}

function webpOpts(filename) {
  return ALPHA_FILES.has(filename) ? ALPHA_WEBP : DEFAULT_WEBP;
}

function hasAlpha(filename) {
  return ALPHA_FILES.has(filename);
}

// ─── Core ──────────────────────────────────────────────────────────────────

async function processImage(srcPath, filename) {
  const ext = path.extname(filename).toLowerCase();
  const base = path.basename(filename, ext);
  const isAlpha = hasAlpha(filename);
  const opts = webpOpts(filename);

  const image = sharp(srcPath);
  const meta = await image.metadata();
  const origW = meta.width;
  const origH = meta.height;

  const results = [];

  for (const targetW of WIDTHS) {
    // Never upscale
    if (targetW > origW) {
      console.log(`  ↷ skip ${targetW}px (source is only ${origW}px wide)`);
      continue;
    }

    const outName = `${base}-${targetW}w`;

    // ── WebP ──────────────────────────────────────────────────────────────
    const webpOut = path.join(OUTPUT_DIR, `${outName}.webp`);

    const pipeline = sharp(srcPath)
      .resize({ width: targetW, withoutEnlargement: true })
      .withMetadata(false); // strip all EXIF

    if (isAlpha) {
      await pipeline.webp(opts).toFile(webpOut);
    } else {
      // Flatten alpha to white before converting opaque images
      await pipeline.flatten({ background: '#ffffff' }).webp(opts).toFile(webpOut);
    }

    const webpStat = fs.statSync(webpOut);
    results.push({ file: `${outName}.webp`, size: bytesToKB(webpStat.size) });

    // ── JPEG fallback ─────────────────────────────────────────────────────
    if (GENERATE_FALLBACK && !isAlpha) {
      const jpgOut = path.join(OUTPUT_DIR, `${outName}.jpg`);
      await sharp(srcPath)
        .resize({ width: targetW, withoutEnlargement: true })
        .flatten({ background: '#ffffff' })
        .withMetadata(false)
        .jpeg(FALLBACK_JPEG)
        .toFile(jpgOut);

      const jpgStat = fs.statSync(jpgOut);
      results.push({ file: `${outName}.jpg`, size: bytesToKB(jpgStat.size) });
    }
  }

  // ── Original-size WebP ────────────────────────────────────────────────
  const fullWebpOut = path.join(OUTPUT_DIR, `${base}.webp`);
  const fullPipeline = sharp(srcPath).withMetadata(false);

  if (isAlpha) {
    await fullPipeline.webp(opts).toFile(fullWebpOut);
  } else {
    await fullPipeline.flatten({ background: '#ffffff' }).webp(opts).toFile(fullWebpOut);
  }

  const fullStat = fs.statSync(fullWebpOut);
  results.push({ file: `${base}.webp`, size: bytesToKB(fullStat.size) });

  // Original size stat for savings report
  const origStat = fs.statSync(srcPath);
  const origKB = bytesToKB(origStat.size);

  console.log(`  ✓ ${filename} (${origW}×${origH}, ${origKB} KB orig${isAlpha ? ', alpha preserved' : ''})`);
  for (const r of results) {
    console.log(`    → ${r.file}  [${r.size} KB]`);
  }
}

// ─── Runner ────────────────────────────────────────────────────────────────

async function run() {
  if (!fs.existsSync(INPUT_DIR)) {
    console.error(`\nInput directory not found: ${INPUT_DIR}`);
    console.error('Create /raw-images and drop your source images there.\n');
    process.exit(1);
  }

  ensureDir(OUTPUT_DIR);

  const files = fs.readdirSync(INPUT_DIR).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ACCEPTED.has(ext) && !f.startsWith('.');
  });

  if (files.length === 0) {
    console.log('No .jpg/.jpeg/.png files found in /raw-images');
    return;
  }

  console.log(`\nOptimizing ${files.length} image(s) → ${OUTPUT_DIR}\n`);

  for (const filename of files) {
    const srcPath = path.join(INPUT_DIR, filename);
    await processImage(srcPath, filename);
  }

  console.log('\nDone.\n');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
