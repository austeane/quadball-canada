#!/usr/bin/env node

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../public');
const inputImage = path.join(publicDir, 'hero-cover.jpg');

const sizes = [
  { width: 1280, suffix: '1280' },
  { width: 1920, suffix: '1920' },
  { width: 2560, suffix: '2560' }
];

async function optimizeImages() {
  console.log('Starting image optimization...');

  // Check if input file exists
  try {
    await fs.access(inputImage);
  } catch (error) {
    console.error('Input file not found:', inputImage);
    return;
  }

  for (const size of sizes) {
    const baseName = 'hero-cover';

    // Create WebP version
    try {
      const webpOutput = path.join(publicDir, `${baseName}-${size.suffix}.webp`);
      await sharp(inputImage)
        .resize(size.width, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ quality: 85 })
        .toFile(webpOutput);
      console.log(`✓ Created ${path.basename(webpOutput)}`);
    } catch (error) {
      console.error(`Error creating WebP at ${size.width}px:`, error.message);
    }

    // Create AVIF version
    try {
      const avifOutput = path.join(publicDir, `${baseName}-${size.suffix}.avif`);
      await sharp(inputImage)
        .resize(size.width, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .avif({ quality: 85 })
        .toFile(avifOutput);
      console.log(`✓ Created ${path.basename(avifOutput)}`);
    } catch (error) {
      console.error(`Error creating AVIF at ${size.width}px:`, error.message);
    }

    // Create optimized JPG version
    try {
      const jpgOutput = path.join(publicDir, `${baseName}-${size.suffix}.jpg`);
      await sharp(inputImage)
        .resize(size.width, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .jpeg({ quality: 90, progressive: true })
        .toFile(jpgOutput);
      console.log(`✓ Created ${path.basename(jpgOutput)}`);
    } catch (error) {
      console.error(`Error creating JPG at ${size.width}px:`, error.message);
    }
  }

  console.log('Image optimization complete!');
}

optimizeImages().catch(console.error);