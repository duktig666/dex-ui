const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Extract original URL from Next.js optimized image URL
function extractOriginalUrl(url) {
  if (url.includes('_next/image?url=')) {
    const match = url.match(/url=([^&]+)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
  }
  return url;
}

const images = [
  // Partners - try common paths
  { url: 'https://based.one/home/ethena.svg', dest: 'partners/ethena.svg' },
  { url: 'https://based.one/home/spartan.svg', dest: 'partners/spartan.svg' },
  { url: 'https://based.one/home/hashed.svg', dest: 'partners/hashed.svg' },
  { url: 'https://based.one/home/delphi.svg', dest: 'partners/delphi.svg' },
  { url: 'https://based.one/home/newman.svg', dest: 'partners/newman.svg' },
  
  // Predictions - extract from Next.js URL
  { url: 'https://based.one/home/prediction-market/powell.png', dest: 'predictions/powell.png' },
  { url: 'https://based.one/home/prediction-market/trump.png', dest: 'predictions/trump.png' },
  
  // Cards
  { url: 'https://based.one/home/based-card.svg', dest: 'cards/based-card.svg' },
  { url: 'https://based.one/cards/orange-card.png', dest: 'cards/orange-card.png' },
  { url: 'https://based.one/cards/gold-card-chip.webp', dest: 'cards/gold-card-chip.webp' },
  { url: 'https://based.one/cards/teal-card.svg', dest: 'cards/teal-card.svg' },
  { url: 'https://based.one/home/hype-blueprint-2.svg', dest: 'cards/hype-blueprint-2.svg' },
  
  // Trading
  { url: 'https://based.one/home/trading-app.png', dest: 'trading/trading-app.png' },
  
  // Features
  { url: 'https://based.one/based-logo-white.svg', dest: 'features/based-logo-white.svg' },
  { url: 'https://based.one/multi-channel/trade-screen.png', dest: 'features/trade-screen.png' },
  { url: 'https://based.one/multi-channel/mobile-screen.png', dest: 'features/mobile-screen.png' },
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const protocol = url.startsWith('https') ? https : http;
    
    const request = protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        file.close();
        fs.unlinkSync(dest);
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        if (fs.existsSync(dest)) {
          fs.unlinkSync(dest);
        }
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded: ${dest}`);
        resolve();
      });
    });
    
    request.on('error', (err) => {
      file.close();
      if (fs.existsSync(dest)) {
        fs.unlinkSync(dest);
      }
      console.error(`✗ Failed: ${url} - ${err.message}`);
      reject(err);
    });
    
    request.setTimeout(30000, () => {
      request.destroy();
      file.close();
      if (fs.existsSync(dest)) {
        fs.unlinkSync(dest);
      }
      reject(new Error(`Timeout downloading ${url}`));
    });
  });
}

async function downloadAll() {
  const baseDir = path.join(__dirname, '../public/images');
  
  for (const image of images) {
    const dest = path.join(baseDir, image.dest);
    const dir = path.dirname(dest);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Skip if file already exists
    if (fs.existsSync(dest)) {
      console.log(`⊘ Skipped (exists): ${image.dest}`);
      continue;
    }
    
    try {
      await downloadFile(image.url, dest);
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Error downloading ${image.url}:`, error.message);
    }
  }
  
  console.log('\nDownload complete!');
}

downloadAll();
