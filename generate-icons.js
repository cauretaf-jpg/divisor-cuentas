const fs = require('fs');
const { createCanvas } = require('canvas');

const svgContent = fs.readFileSync('icon-512.svg', 'utf8');
const canvas = createCanvas(512, 512);
const ctx = canvas.getContext('2d');

const img = new Image();
img.onload = () => {
  ctx.drawImage(img, 0, 0, 512, 512);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('icon-512.png', buffer);
  console.log('Created icon-512.png');
};
img.src = 'data:image/svg+xml;base64,' + Buffer.from(svgContent).toString('base64');
