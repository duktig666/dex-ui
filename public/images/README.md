# 图片资源下载指南

本目录用于存放从 based.one 网站下载的图片资源。

## 需要下载的图片

### 1. 合作伙伴 Logo (partners/)
```bash
# 下载合作伙伴 Logo（如果直接访问失败，请从 based.one 网站右键保存）
curl -L "https://based.one/home/ethena.svg" -o partners/ethena.svg
curl -L "https://based.one/home/spartan.svg" -o partners/spartan.svg
curl -L "https://based.one/home/hashed.svg" -o partners/hashed.svg
curl -L "https://based.one/home/delphi.svg" -o partners/delphi.svg
curl -L "https://based.one/home/newman.svg" -o partners/newman.svg
```

### 2. 预测市场图片 (predictions/)
```bash
curl -L "https://based.one/home/prediction-market/powell.png" -o predictions/powell.png
curl -L "https://based.one/home/prediction-market/trump.png" -o predictions/trump.png
```

### 3. 卡片图片 (cards/)
```bash
curl -L "https://based.one/home/based-card.svg" -o cards/based-card.svg
curl -L "https://based.one/cards/orange-card.png" -o cards/orange-card.png
curl -L "https://based.one/cards/gold-card-chip.webp" -o cards/gold-card-chip.webp
curl -L "https://based.one/cards/teal-card.svg" -o cards/teal-card.svg
curl -L "https://based.one/home/hype-blueprint-2.svg" -o cards/hype-blueprint-2.svg
```

### 4. 交易界面 (trading/)
```bash
curl -L "https://based.one/home/trading-app.png" -o trading/trading-app.png
```

### 5. 功能展示 (features/)
```bash
curl -L "https://based.one/based-logo-white.svg" -o features/based-logo-white.svg
curl -L "https://based.one/multi-channel/trade-screen.png" -o features/trade-screen.png
curl -L "https://based.one/multi-channel/mobile-screen.png" -o features/mobile-screen.png
```

## 快速下载脚本

运行以下命令一次性下载所有图片：

```bash
cd /Users/renshiwei/code/company/DEX/dex-ui
node scripts/download-images.js
```

## 手动下载方法

如果脚本下载失败，可以：

1. 访问 https://based.one/
2. 打开浏览器开发者工具 (F12)
3. 在 Network 标签中筛选图片资源
4. 找到对应的图片，右键保存到对应目录

## 目录结构

```
public/images/
├── partners/      # 合作伙伴 Logo
├── predictions/   # 预测市场人物图片
├── cards/         # 卡片相关图片
├── trading/       # 交易界面图片
└── features/      # 功能展示图片
```

## 注意事项

- 如果图片下载失败，组件会显示文字 fallback
- 确保图片文件名与代码中的路径一致
- SVG 文件可以直接使用，PNG/WebP 文件会自动优化

