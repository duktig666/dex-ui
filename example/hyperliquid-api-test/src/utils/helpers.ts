/**
 * 移除数字字符串的尾随零
 * HyperLiquid API 要求价格和数量不能有尾随零
 * @example "50000.00" -> "50000"
 * @example "0.10000" -> "0.1"
 */
export function removeTrailingZeros(value: string): string {
  if (!value.includes('.')) return value;
  return value.replace(/\.?0+$/, '');
}

/**
 * 格式化价格 - 移除尾随零
 */
export function formatPrice(price: string | number): string {
  return removeTrailingZeros(String(price));
}

/**
 * 格式化数量 - 移除尾随零
 */
export function formatSize(size: string | number): string {
  return removeTrailingZeros(String(size));
}

/**
 * 获取当前时间戳 (毫秒)
 */
export function nowMs(): number {
  return Date.now();
}

/**
 * 将地址转换为小写 (HyperLiquid 要求地址小写)
 */
export function normalizeAddress(address: string): string {
  return address.toLowerCase();
}

/**
 * 生成随机的客户端订单 ID (128位十六进制)
 * 格式: 0x + 32 个十六进制字符
 */
export function generateCloid(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 计算 24 小时涨跌幅
 * @param currentPrice 当前价格
 * @param prevDayPrice 前日收盘价
 * @returns 涨跌幅百分比
 */
export function calc24hChange(currentPrice: string, prevDayPrice: string): number {
  const current = parseFloat(currentPrice);
  const prev = parseFloat(prevDayPrice);
  if (prev === 0) return 0;
  return ((current - prev) / prev) * 100;
}

/**
 * 格式化资金费率为百分比
 * @param fundingRate 资金费率 (小数形式)
 * @returns 百分比字符串
 */
export function formatFundingRate(fundingRate: string): string {
  const rate = parseFloat(fundingRate);
  return (rate * 100).toFixed(4) + '%';
}

/**
 * 延迟执行
 * @param ms 毫秒数
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 格式化 USDC 金额 (6 位小数)
 */
export function formatUsdc(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num.toFixed(6);
}

/**
 * 解析 USDC 金额 (从 6 位小数字符串)
 */
export function parseUsdc(amount: string): number {
  return parseFloat(amount);
}
