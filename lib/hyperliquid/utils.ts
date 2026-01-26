/**
 * HyperLiquid API 工具函数
 */

import Decimal from 'decimal.js';

/**
 * 将浮点数转换为 HyperLiquid API 要求的字符串格式
 * - 去除尾部多余的零
 * - 处理精度问题
 *
 * @param value - 要转换的数值
 * @param decimals - 小数位数精度
 * @returns 格式化后的字符串
 */
export function floatToWire(value: number | string, decimals: number = 8): string {
  const d = new Decimal(value);
  // 四舍五入到指定精度
  const rounded = d.toDecimalPlaces(decimals, Decimal.ROUND_DOWN);
  // 转换为字符串并去除尾部零
  let str = rounded.toFixed(decimals);
  // 去除尾部的零
  if (str.includes('.')) {
    str = str.replace(/\.?0+$/, '');
  }
  return str || '0';
}

/**
 * 将字符串价格转换为数字
 * @param px - 价格字符串
 * @returns 数字
 */
export function parsePrice(px: string): number {
  return parseFloat(px);
}

/**
 * 将字符串数量转换为数字
 * @param sz - 数量字符串
 * @returns 数字
 */
export function parseSize(sz: string): number {
  return parseFloat(sz);
}

/**
 * 格式化价格显示
 * @param price - 价格
 * @param decimals - 小数位数
 * @returns 格式化后的字符串
 */
export function formatPrice(price: number | string, decimals: number = 2): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * 格式化数量显示
 * @param size - 数量
 * @param decimals - 小数位数
 * @returns 格式化后的字符串
 */
export function formatSize(size: number | string, decimals: number = 4): string {
  const num = typeof size === 'string' ? parseFloat(size) : size;
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * 格式化百分比显示
 * @param value - 百分比值 (如 0.05 表示 5%)
 * @param decimals - 小数位数
 * @returns 格式化后的字符串，带 % 符号
 */
export function formatPercent(value: number | string, decimals: number = 2): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0.00%';
  return `${(num * 100).toFixed(decimals)}%`;
}

/**
 * 格式化 USD 金额
 * @param value - 金额
 * @param decimals - 小数位数
 * @returns 格式化后的字符串，带 $ 符号
 */
export function formatUsd(value: number | string, decimals: number = 2): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '$0.00';
  return `$${num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * 格式化大数字 (K, M, B)
 * @param value - 数值
 * @returns 格式化后的字符串
 */
export function formatCompact(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';

  const absNum = Math.abs(num);
  if (absNum >= 1e9) {
    return `${(num / 1e9).toFixed(2)}B`;
  }
  if (absNum >= 1e6) {
    return `${(num / 1e6).toFixed(2)}M`;
  }
  if (absNum >= 1e3) {
    return `${(num / 1e3).toFixed(2)}K`;
  }
  return num.toFixed(2);
}

/**
 * 生成 nonce (当前时间戳，毫秒)
 * @returns nonce
 */
export function generateNonce(): number {
  return Date.now();
}

/**
 * 生成随机的 client order id (cloid)
 * @returns 16进制格式的 cloid
 */
export function generateCloid(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return (
    '0x' +
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  );
}

/**
 * 将地址转换为小写 (HyperLiquid 要求)
 * @param address - 以太坊地址
 * @returns 小写地址
 */
export function normalizeAddress(address: string): string {
  return address.toLowerCase();
}

/**
 * 根据交易对名称获取 asset index
 * @param coin - 交易对名称 (如 "BTC", "ETH")
 * @param universe - 交易对元数据数组
 * @returns asset index
 */
export function getAssetIndex(coin: string, universe: { name: string }[]): number {
  const index = universe.findIndex((meta) => meta.name === coin);
  if (index === -1) {
    throw new Error(`Asset ${coin} not found in universe`);
  }
  return index;
}

/**
 * 计算订单的名义价值
 * @param price - 价格
 * @param size - 数量
 * @returns 名义价值
 */
export function calcNotionalValue(price: number | string, size: number | string): number {
  const p = typeof price === 'string' ? parseFloat(price) : price;
  const s = typeof size === 'string' ? parseFloat(size) : Math.abs(size);
  return p * s;
}

/**
 * 计算所需保证金
 * @param notionalValue - 名义价值
 * @param leverage - 杠杆倍数
 * @returns 所需保证金
 */
export function calcRequiredMargin(notionalValue: number, leverage: number): number {
  return notionalValue / leverage;
}

/**
 * 计算 PnL 百分比
 * @param pnl - 盈亏金额
 * @param margin - 保证金
 * @returns PnL 百分比
 */
export function calcPnlPercent(pnl: number, margin: number): number {
  if (margin === 0) return 0;
  return pnl / margin;
}

/**
 * 根据 Side 转换为订单方向
 * @param side - 'A' (Ask/Sell) 或 'B' (Bid/Buy)
 * @returns 'buy' 或 'sell'
 */
export function sideToOrderSide(side: 'A' | 'B'): 'buy' | 'sell' {
  return side === 'B' ? 'buy' : 'sell';
}

/**
 * 根据订单方向转换为 Side
 * @param orderSide - 'buy' 或 'sell'
 * @returns 'A' (Ask/Sell) 或 'B' (Bid/Buy)
 */
export function orderSideToSide(orderSide: 'buy' | 'sell'): 'A' | 'B' {
  return orderSide === 'buy' ? 'B' : 'A';
}

/**
 * 根据持仓数量判断多空
 * @param szi - 有符号持仓数量
 * @returns 'long', 'short' 或 null (无持仓)
 */
export function getSideFromPosition(szi: string | number): 'long' | 'short' | null {
  const size = typeof szi === 'string' ? parseFloat(szi) : szi;
  if (size > 0) return 'long';
  if (size < 0) return 'short';
  return null;
}

/**
 * 计算价格变化百分比
 * @param currentPrice - 当前价格
 * @param prevPrice - 前一价格
 * @returns 变化百分比
 */
export function calcPriceChange(currentPrice: number | string, prevPrice: number | string): number {
  const curr = typeof currentPrice === 'string' ? parseFloat(currentPrice) : currentPrice;
  const prev = typeof prevPrice === 'string' ? parseFloat(prevPrice) : prevPrice;
  if (prev === 0) return 0;
  return (curr - prev) / prev;
}

/**
 * 将时间戳转换为日期字符串
 * @param timestamp - 时间戳 (毫秒)
 * @returns 日期字符串
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

/**
 * 将时间戳转换为时间字符串 (HH:MM:SS)
 * @param timestamp - 时间戳 (毫秒)
 * @returns 时间字符串
 */
export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}

/**
 * 根据价格计算 tick size
 * @param price - 价格
 * @returns tick size
 */
export function getTickSize(price: number): number {
  if (price >= 10000) return 1;
  if (price >= 1000) return 0.1;
  if (price >= 100) return 0.01;
  if (price >= 10) return 0.001;
  if (price >= 1) return 0.0001;
  return 0.00001;
}

/**
 * 将价格调整到有效的 tick
 * @param price - 原始价格
 * @param tickSize - tick size
 * @param roundUp - 是否向上取整
 * @returns 调整后的价格
 */
export function roundToTick(price: number, tickSize: number, roundUp: boolean = false): number {
  const d = new Decimal(price);
  const tick = new Decimal(tickSize);
  if (roundUp) {
    return d.div(tick).ceil().mul(tick).toNumber();
  }
  return d.div(tick).floor().mul(tick).toNumber();
}

/**
 * 获取价格精度 (小数位数)
 * @param tickSize - tick size
 * @returns 小数位数
 */
export function getPriceDecimals(tickSize: number): number {
  if (tickSize >= 1) return 0;
  const str = tickSize.toString();
  const dotIndex = str.indexOf('.');
  if (dotIndex === -1) return 0;
  return str.length - dotIndex - 1;
}

/**
 * 验证订单数量是否符合 lot size
 * @param size - 订单数量
 * @param szDecimals - 数量精度
 * @returns 是否有效
 */
export function validateSize(size: number, szDecimals: number): boolean {
  const d = new Decimal(size);
  const minSize = new Decimal(10).pow(-szDecimals);
  return d.gte(minSize) && d.mod(minSize).eq(0);
}

/**
 * 将数量调整到有效的 lot size
 * @param size - 原始数量
 * @param szDecimals - 数量精度
 * @returns 调整后的数量
 */
export function roundToLot(size: number, szDecimals: number): number {
  const d = new Decimal(size);
  return d.toDecimalPlaces(szDecimals, Decimal.ROUND_DOWN).toNumber();
}

/**
 * 根据币种获取价格小数位
 * @param coin - 交易对名称
 * @param price - 当前价格
 * @returns 推荐的小数位数
 */
export function getRecommendedPriceDecimals(coin: string, price: number): number {
  // 稳定币
  if (['USDC', 'USDT', 'DAI'].includes(coin)) {
    return 4;
  }
  // 根据价格动态决定
  return getPriceDecimals(getTickSize(price));
}
