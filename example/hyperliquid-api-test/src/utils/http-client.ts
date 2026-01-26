import type { InfoRequest } from '../types/info';
import type { ExchangeRequest, ExchangeAction, ExchangeResponse } from '../types/exchange';

// 请求间隔 (毫秒)，避免 429 限流
const REQUEST_DELAY = 200;
// 最大重试次数
const MAX_RETRIES = 5;
// 429 错误重试延迟 (毫秒)
const RETRY_DELAY = 2000;

/**
 * 延迟函数
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * HyperLiquid API HTTP 客户端
 */
export class HttpClient {
  private baseUrl: string;
  private lastRequestTime = 0;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * 确保请求间隔
   */
  private async ensureDelay(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < REQUEST_DELAY) {
      await sleep(REQUEST_DELAY - elapsed);
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * 带重试的 fetch
   */
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    retries = MAX_RETRIES
  ): Promise<Response> {
    await this.ensureDelay();

    const response = await fetch(url, options);

    // 如果是 429 错误且还有重试次数，则等待后重试
    if (response.status === 429 && retries > 0) {
      await sleep(RETRY_DELAY);
      return this.fetchWithRetry(url, options, retries - 1);
    }

    return response;
  }

  /**
   * 发送 Info API 请求 (POST /info)
   */
  async info<T>(request: InfoRequest): Promise<T> {
    const response = await this.fetchWithRetry(`${this.baseUrl}/info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Info API error: ${response.status} - ${text}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * 发送 Exchange API 请求 (POST /exchange)
   */
  async exchange<T = ExchangeResponse>(
    request: ExchangeRequest<ExchangeAction>
  ): Promise<T> {
    const response = await this.fetchWithRetry(`${this.baseUrl}/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Exchange API error: ${response.status} - ${text}`);
    }

    return response.json() as Promise<T>;
  }
}
