# 图片优化和样式复刻总结

## 图片完整性检查

根据检查，所有图片文件已下载完成：

### ✅ 已下载的图片

- **合作伙伴 Logo (5个)**: ethena.svg, spartan.svg, hashed.svg, delphi.svg, newman.svg
- **预测市场 (2个)**: powell.png, trump.png
- **卡片 (5个)**: based-card.svg, orange-card.png, gold-card-chip.webp, teal-card.svg, hype-blueprint-2.svg
- **交易界面 (1个)**: trading-app.png
- **功能展示 (3个)**: based-logo-white.svg, trade-screen.png, mobile-screen.png

**总计**: 16 个图片文件

## 样式优化 - 1:1 复刻 based.one

### 1. Partners (Backed By) 区块 ✅

**优化内容**:

- 使用真实 SVG Logo 图片
- 添加 `opacity-50 hover:opacity-100` 过渡效果
- 间距调整为 `gap-12 lg:gap-16` 匹配原站
- Logo 高度设置为 `h-8` (32px)

**文件**: `components/sections/Partners.tsx`

### 2. Predictions 预测市场区块 ✅

**优化内容**:

- 使用真实人物图片 (powell.png, trump.png)
- **精确匹配 based.one 的定位**:
  - Powell: `bottom: 25.3281px, left: 169.148px, transform: matrix(1.15, 0, 0, 1.15, -199, 0)`
  - Trump: `bottom: 25.3281px, left: 177.109px, transform: matrix(1.15, 0, 0, 1.15, -199, 0)`
  - 圆角: Powell `borderRadius: 0px 0px 24px 24px`, Trump `borderRadius: 0px 0px 24px`
- 容器尺寸: `398px x 478px`
- YES/NO 标签位置和样式匹配

**文件**: `components/sections/Predictions.tsx`

### 3. Borderless Spending 卡片区块 ✅

**优化内容**:

- **精确的 7x3 网格布局** (21 个卡片)
- 主卡片位置: 第 3、10、17 个位置 (每行中心)
- 主卡片样式:
  - orange-card.png: `opacity: 0.5` + `drop-shadow`
  - gold-card-chip.webp: `opacity: 1` + `drop-shadow`
  - teal-card.svg: `opacity: 0.5` + `drop-shadow`
- 蓝图卡片使用 `based-card.svg` 和 `hype-blueprint-2.svg`
- 悬停效果: 主卡片 `hover:opacity-100`

**文件**: `components/sections/BorderlessCard.tsx`

### 4. Trade Crypto 24/7 区块 ✅

**优化内容**:

- 使用 `trading-app.png` 作为背景图片
- 背景位置: `top: 10%`, 透明度 `opacity-10`
- 添加网格图案叠加层
- 添加径向渐变光晕效果

**文件**: `components/sections/TradeCrypto.tsx`

### 5. Features 功能展示区块 ✅

**优化内容**:

- **HyENA 区块**: 使用 `based-logo-white.svg`，尺寸 `53.3281px x 16px`，`opacity: 0.8`
- **Multi-channel 区块**:
  - Desktop: `trade-screen.png` (512px x 400px)
  - Mobile: `mobile-screen.png` (170.664px x 347.914px)
- 精确匹配 based.one 的图片尺寸

**文件**: `components/sections/Features.tsx`

## 关键样式匹配点

### 卡片网格布局

```css
/* 7 列网格 */
grid-template-columns: repeat(7, 1fr);
gap: 8px; /* gap-2 */

/* 主卡片 */
opacity: 0.5; /* 或 1 */
filter: drop-shadow(rgba(0, 0, 0, 0.15) 0px 25px 25px);
```

### 预测市场人物图片

```css
/* 精确的绝对定位 */
position: absolute;
bottom: 25.3281px;
left: 169.148px; /* Powell */
left: 177.109px; /* Trump */
transform: matrix(1.15, 0, 0, 1.15, -199, 0);
```

### 合作伙伴 Logo

```css
opacity: 0.5;
transition: opacity 0.3s;
/* hover */
opacity: 1;
```

## 检查脚本

运行以下命令检查图片完整性：

```bash
node scripts/check-images.js
```

## 下一步

所有组件已优化为 1:1 匹配 based.one 的样式。可以运行开发服务器查看效果：

```bash
npm run dev
```

访问 http://localhost:3000 查看复刻效果。
