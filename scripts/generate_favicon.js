const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

function createSvg(size, fontSize, rx, strokeWidth, starRadius) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#fcd34d"/>
    </linearGradient>
  </defs>
  <rect x="${strokeWidth}" y="${strokeWidth}" width="${size - strokeWidth * 2}" height="${size - strokeWidth * 2}" rx="${rx}" fill="url(#bg)" stroke="url(#gold)" stroke-width="${strokeWidth}"/>
  <text x="${size * 0.44}" y="${size * 0.72}" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="900" fill="url(#gold)" text-anchor="middle">L</text>
  <circle cx="${size * 0.76}" cy="${size * 0.28}" r="${starRadius}" fill="#fcd34d"/>
</svg>`;
}

function createMultiIco(images) {
  const count = images.length;
  const headerSize = 6 + 16 * count;
  const header = Buffer.alloc(headerSize);

  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // icon
  header.writeUInt16LE(count, 4); // count

  let currentOffset = headerSize;
  const buffers = [header];

  images.forEach((img, i) => {
    const entryOffset = 6 + i * 16;
    header.writeUInt8(img.width >= 256 ? 0 : img.width, entryOffset + 0);
    header.writeUInt8(img.height >= 256 ? 0 : img.height, entryOffset + 1);
    header.writeUInt8(0, entryOffset + 2); // color palette
    header.writeUInt8(0, entryOffset + 3); // reserved
    header.writeUInt16LE(1, entryOffset + 4); // planes
    header.writeUInt16LE(32, entryOffset + 6); // bits per pixel
    header.writeUInt32LE(img.buf.length, entryOffset + 8); // size
    header.writeUInt32LE(currentOffset, entryOffset + 12); // offset

    currentOffset += img.buf.length;
    buffers.push(img.buf);
  });

  return Buffer.concat(buffers);
}

async function run() {
  const s16 = await sharp(Buffer.from(createSvg(16, 10, 3, 1, 1))).resize(16, 16).png().toBuffer();
  const s32 = await sharp(Buffer.from(createSvg(32, 20, 7, 1.5, 2))).resize(32, 32).png().toBuffer();
  const s48 = await sharp(Buffer.from(createSvg(48, 30, 11, 2.5, 3.5))).resize(48, 48).png().toBuffer();
  const s180 = await sharp(Buffer.from(createSvg(180, 110, 40, 8, 12))).resize(180, 180).png().toBuffer();

  const icoBuf = createMultiIco([
    { buf: s16, width: 16, height: 16 },
    { buf: s32, width: 32, height: 32 },
    { buf: s48, width: 48, height: 48 },
  ]);

  // Write multi-res ICO
  fs.writeFileSync(path.join('app', 'favicon.ico'), icoBuf);
  fs.writeFileSync(path.join('public', 'favicon.ico'), icoBuf);

  // Write PNG icons
  fs.writeFileSync(path.join('app', 'icon.png'), s32);
  fs.writeFileSync(path.join('public', 'icon.png'), s32);
  fs.writeFileSync(path.join('app', 'apple-icon.png'), s180);
  fs.writeFileSync(path.join('public', 'apple-touch-icon.png'), s180);

  // Write SVG vector
  const svgVector = createSvg(64, 40, 14, 3, 4.5);
  fs.writeFileSync(path.join('app', 'icon.svg'), svgVector);
  fs.writeFileSync(path.join('public', 'favicon.svg'), svgVector);

  console.log('Successfully generated full suite of true multi-resolution icons and favicons!');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
