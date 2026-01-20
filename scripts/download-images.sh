#!/bin/bash

# Create directories
mkdir -p public/images/partners
mkdir -p public/images/predictions
mkdir -p public/images/cards
mkdir -p public/images/trading
mkdir -p public/images/features

echo "Downloading images from based.one..."

# Partners
echo "Downloading partner logos..."
curl -L "https://based.one/home/ethena.svg" -o public/images/partners/ethena.svg 2>/dev/null || echo "Failed: ethena.svg"
curl -L "https://based.one/home/spartan.svg" -o public/images/partners/spartan.svg 2>/dev/null || echo "Failed: spartan.svg"
curl -L "https://based.one/home/hashed.svg" -o public/images/partners/hashed.svg 2>/dev/null || echo "Failed: hashed.svg"
curl -L "https://based.one/home/delphi.svg" -o public/images/partners/delphi.svg 2>/dev/null || echo "Failed: delphi.svg"
curl -L "https://based.one/home/newman.svg" -o public/images/partners/newman.svg 2>/dev/null || echo "Failed: newman.svg"

# Predictions
echo "Downloading prediction images..."
curl -L "https://based.one/home/prediction-market/powell.png" -o public/images/predictions/powell.png 2>/dev/null || echo "Failed: powell.png"
curl -L "https://based.one/home/prediction-market/trump.png" -o public/images/predictions/trump.png 2>/dev/null || echo "Failed: trump.png"

# Cards
echo "Downloading card images..."
curl -L "https://based.one/home/based-card.svg" -o public/images/cards/based-card.svg 2>/dev/null || echo "Failed: based-card.svg"
curl -L "https://based.one/cards/orange-card.png" -o public/images/cards/orange-card.png 2>/dev/null || echo "Failed: orange-card.png"
curl -L "https://based.one/cards/gold-card-chip.webp" -o public/images/cards/gold-card-chip.webp 2>/dev/null || echo "Failed: gold-card-chip.webp"
curl -L "https://based.one/cards/teal-card.svg" -o public/images/cards/teal-card.svg 2>/dev/null || echo "Failed: teal-card.svg"
curl -L "https://based.one/home/hype-blueprint-2.svg" -o public/images/cards/hype-blueprint-2.svg 2>/dev/null || echo "Failed: hype-blueprint-2.svg"

# Trading
echo "Downloading trading images..."
curl -L "https://based.one/home/trading-app.png" -o public/images/trading/trading-app.png 2>/dev/null || echo "Failed: trading-app.png"

# Features
echo "Downloading feature images..."
curl -L "https://based.one/based-logo-white.svg" -o public/images/features/based-logo-white.svg 2>/dev/null || echo "Failed: based-logo-white.svg"
curl -L "https://based.one/multi-channel/trade-screen.png" -o public/images/features/trade-screen.png 2>/dev/null || echo "Failed: trade-screen.png"
curl -L "https://based.one/multi-channel/mobile-screen.png" -o public/images/features/mobile-screen.png 2>/dev/null || echo "Failed: mobile-screen.png"

echo ""
echo "Download complete! Check public/images/ for downloaded files."
echo "Note: Some images may fail to download. You can manually download them from https://based.one/"

