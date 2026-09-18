import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);
const { Jimp, rgbaToInt } = require('jimp');

async function generateIcon(size, isRound = false) {
  const image = new Jimp({ width: size, height: size, color: 0x00000000 });
  const amber = rgbaToInt(245, 158, 11, 255); // #F59E0B
  const black = rgbaToInt(0, 0, 0, 255);
  
  const scale = size / 512;
  const radius = isRound ? size / 2 : (size * 0.22);
  
  // Fill amber background (rounded rect or circle)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (isRound) {
        const dx = x - size / 2;
        const dy = y - size / 2;
        if (dx * dx + dy * dy <= radius * radius) {
          image.setPixelColor(amber, x, y);
        }
      } else {
        // Rounded rectangle
        const cornerR = radius;
        let inside = true;
        if (x < cornerR && y < cornerR) {
          inside = Math.hypot(x - cornerR, y - cornerR) <= cornerR;
        } else if (x >= size - cornerR && y < cornerR) {
          inside = Math.hypot(x - (size - cornerR), y - cornerR) <= cornerR;
        } else if (x < cornerR && y >= size - cornerR) {
          inside = Math.hypot(x - cornerR, y - (size - cornerR)) <= cornerR;
        } else if (x >= size - cornerR && y >= size - cornerR) {
          inside = Math.hypot(x - (size - cornerR), y - (size - cornerR)) <= cornerR;
        }
        if (inside) {
          image.setPixelColor(amber, x, y);
        }
      }
    }
  }

  // Draw Drum and Drumsticks
  // Helper to draw thick line
  function drawThickLine(x1, y1, x2, y2, thickness, color) {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.ceil(len * 2);
    const halfThick = thickness / 2;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const cx = x1 + (x2 - x1) * t;
      const cy = y1 + (y2 - y1) * t;
      for (let dy = -halfThick; dy <= halfThick; dy++) {
        for (let dx = -halfThick; dx <= halfThick; dx++) {
          if (dx * dx + dy * dy <= halfThick * halfThick) {
            const px = Math.round(cx + dx);
            const py = Math.round(cy + dy);
            if (px >= 0 && px < size && py >= 0 && py < size) {
              image.setPixelColor(color, px, py);
            }
          }
        }
      }
    }
  }

  // Helper to draw thick ellipse outline
  function drawThickEllipse(cx, cy, rx, ry, thickness, color) {
    const steps = Math.ceil(Math.PI * 2 * Math.max(rx, ry) * 2);
    const halfThick = thickness / 2;
    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const ex = cx + Math.cos(angle) * rx;
      const ey = cy + Math.sin(angle) * ry;
      for (let dy = -halfThick; dy <= halfThick; dy++) {
        for (let dx = -halfThick; dx <= halfThick; dx++) {
          if (dx * dx + dy * dy <= halfThick * halfThick) {
            const px = Math.round(ex + dx);
            const py = Math.round(ey + dy);
            if (px >= 0 && px < size && py >= 0 && py < size) {
              image.setPixelColor(color, px, py);
            }
          }
        }
      }
    }
  }

  const th = Math.max(2, Math.round(32 * scale));

  // Drumsticks
  drawThickLine(130 * scale, 95 * scale, 246 * scale, 220 * scale, th * 0.9, black);
  drawThickLine(382 * scale, 95 * scale, 266 * scale, 220 * scale, th * 0.9, black);

  // Shell Sides and Bottom Curve
  drawThickLine(96 * scale, 230 * scale, 96 * scale, 345 * scale, th, black);
  drawThickLine(416 * scale, 230 * scale, 416 * scale, 345 * scale, th, black);
  
  // Bottom curved arc
  const bottomSteps = 100;
  for (let i = 0; i < bottomSteps; i++) {
    const t1 = i / bottomSteps;
    const t2 = (i + 1) / bottomSteps;
    const angle1 = Math.PI * (1 - t1);
    const angle2 = Math.PI * (1 - t2);
    const x1 = 256 * scale + Math.cos(angle1) * (160 * scale);
    const y1 = 345 * scale + Math.sin(angle1) * (38 * scale);
    const x2 = 256 * scale + Math.cos(angle2) * (160 * scale);
    const y2 = 345 * scale + Math.sin(angle2) * (38 * scale);
    drawThickLine(x1, y1, x2, y2, th, black);
  }

  // Vertical rods
  const rodXs = [150, 203, 256, 309, 362];
  rodXs.forEach(rx => {
    const normX = (rx - 256) / 160;
    const arcYTop = 230 + Math.sqrt(Math.max(0, 1 - normX * normX)) * 52;
    const arcYBottom = 345 + Math.sqrt(Math.max(0, 1 - normX * normX)) * 38;
    drawThickLine(rx * scale, arcYTop * scale, rx * scale, arcYBottom * scale, th * 0.9, black);
  });

  // Top Drum Rim Ellipse
  drawThickEllipse(256 * scale, 230 * scale, 160 * scale, 52 * scale, th, black);

  return image;
}

async function main() {
  console.log('Generating high-fidelity icons...');
  
  // Public icons
  const icon512 = await generateIcon(512);
  await icon512.write('public/icon.png');
  await icon512.write('public/icon-512.png');
  
  const icon192 = await generateIcon(192);
  await icon192.write('public/icon-192.png');
  
  const icon64 = await generateIcon(64);
  await icon64.write('public/favicon.png');

  // Android mipmap launcher icons
  const densities = [
    { dir: 'mipmap-mdpi', size: 48 },
    { dir: 'mipmap-hdpi', size: 72 },
    { dir: 'mipmap-xhdpi', size: 96 },
    { dir: 'mipmap-xxhdpi', size: 144 },
    { dir: 'mipmap-xxxhdpi', size: 192 }
  ];

  for (const d of densities) {
    const dirPath = path.join('android/app/src/main/res', d.dir);
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
    
    const squareIcon = await generateIcon(d.size, false);
    await squareIcon.write(path.join(dirPath, 'ic_launcher.png'));
    await squareIcon.write(path.join(dirPath, 'ic_launcher_foreground.png'));

    const roundIcon = await generateIcon(d.size, true);
    await roundIcon.write(path.join(dirPath, 'ic_launcher_round.png'));
  }

  // Splash screen icons
  const splashDensities = [
    { dir: 'drawable', w: 480, h: 800 },
    { dir: 'drawable-port-mdpi', w: 320, h: 480 },
    { dir: 'drawable-port-hdpi', w: 480, h: 800 },
    { dir: 'drawable-port-xhdpi', w: 720, h: 1280 },
    { dir: 'drawable-port-xxhdpi', w: 960, h: 1600 },
    { dir: 'drawable-port-xxxhdpi', w: 1280, h: 1920 },
    { dir: 'drawable-land-mdpi', w: 480, h: 320 },
    { dir: 'drawable-land-hdpi', w: 800, h: 480 },
    { dir: 'drawable-land-xhdpi', w: 1280, h: 720 },
    { dir: 'drawable-land-xxhdpi', w: 1600, h: 960 },
    { dir: 'drawable-land-xxxhdpi', w: 1920, h: 1280 }
  ];

  const splashLogo = await generateIcon(256, false);

  for (const s of splashDensities) {
    const dirPath = path.join('android/app/src/main/res', s.dir);
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
    
    const splashImg = new Jimp({ width: s.w, height: s.h, color: 0x090D16FF }); // #090D16 dark slate background
    const logoX = Math.round((s.w - 256) / 2);
    const logoY = Math.round((s.h - 256) / 2);
    splashImg.composite(splashLogo, logoX, logoY);
    await splashImg.write(path.join(dirPath, 'splash.png'));
  }

  console.log('All icons and splash screens generated successfully!');
}

main().catch(console.error);
