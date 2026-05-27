import sharp from 'sharp';
import { existsSync } from 'fs';

const src = 'public/icon-512.png';

if (!existsSync(src)) {
  console.error('❌ public/icon-512.png not found!');
  process.exit(1);
}

const sizes = [
  { name: 'public/favicon-16.png', size: 16 },
  { name: 'public/favicon-32.png', size: 32 },
  { name: 'public/apple-touch-icon.png', size: 180 },
  { name: 'public/pwa-192x192.png', size: 192 },
  { name: 'public/pwa-512x512.png', size: 512 },
];

for (const { name, size } of sizes) {
  await sharp(src).resize(size, size).toFile(name);
  console.log(`✅ Generated ${name}`);
}

// Generate a simple ICO (use 32px PNG renamed for now, browsers accept PNG favicon)
await sharp(src).resize(32, 32).toFile('public/favicon.ico');
console.log('✅ Generated public/favicon.ico');

console.log('\n🎉 All icons generated successfully!');
