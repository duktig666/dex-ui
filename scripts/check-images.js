/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const requiredImages = {
  partners: ['ethena.svg', 'spartan.svg', 'hashed.svg', 'delphi.svg', 'newman.svg'],
  predictions: ['powell.png', 'trump.png'],
  cards: [
    'based-card.svg',
    'orange-card.png',
    'gold-card-chip.webp',
    'teal-card.svg',
    'hype-blueprint-2.svg',
  ],
  trading: ['trading-app.png'],
  features: ['based-logo-white.svg', 'trade-screen.png', 'mobile-screen.png'],
};

function checkImages() {
  const baseDir = path.join(__dirname, '../public/images');
  const missing = [];
  const found = [];

  console.log('=== 图片完整性检查 ===\n');

  for (const [category, files] of Object.entries(requiredImages)) {
    console.log(`检查 ${category}/ 目录:`);
    const categoryDir = path.join(baseDir, category);

    for (const file of files) {
      const filePath = path.join(categoryDir, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`  ✓ ${file} (${(stats.size / 1024).toFixed(1)}KB)`);
        found.push(`${category}/${file}`);
      } else {
        console.log(`  ✗ ${file} - 缺失`);
        missing.push(`${category}/${file}`);
      }
    }
    console.log('');
  }

  console.log('=== 检查结果 ===');
  console.log(`已找到: ${found.length}/${Object.values(requiredImages).flat().length} 个文件`);
  console.log(`缺失: ${missing.length} 个文件`);

  if (missing.length > 0) {
    console.log('\n缺失的文件:');
    missing.forEach((file) => console.log(`  - ${file}`));
    console.log('\n请运行下载脚本: ./scripts/download-images.sh');
    process.exit(1);
  } else {
    console.log('\n✓ 所有图片文件完整！');
    process.exit(0);
  }
}

checkImages();
