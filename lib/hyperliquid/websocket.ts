/**
 * HyperLiquid WebSocket 客户端
 * 基于 reconnecting-websocket 实现自动重连
 */

import ReconnectingWebSocket from 'reconnecting-websocket';
import { WS_URL, WS_PING_INTERVAL, CURRENT_NETWORK } from './constants';
import type {
  WsSubscription,
  WsL2BookSubscription,
  WsTradesSubscription,
  WsCandleSubscription,
  WsAllMidsSubscription,
  WsUserEventsSubscription,
  WsOrderUpdatesSubscription,
  WsUserFillsSubscription,
  WsMessage,
  WsL2BookData,
  WsTradeData,
  WsCandleData,
  WsAllMidsData,
} from './types';

// 订阅回调类型
type SubscriptionCallback<T = unknown> = (data: T) => void;

// 订阅信息
interface Subscription {
  subscription: WsSubscription;
  callbacks: Set<SubscriptionCallback>;
}

/**
 * HyperLiquid WebSocket 管理器
 * 单例模式，管理所有 WebSocket 订阅
 */
export class HyperliquidWebSocket {
  private static instance: HyperliquidWebSocket;
  private ws: ReconnectingWebSocket | null = null;
  private subscriptions: Map<string, Subscription> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;
  private isConnected: boolean = false;
  private pendingSubscriptions: WsSubscription[] = [];
  private connectionPromise: Promise<void> | null = null;
  private resolveConnection: (() => void) | null = null;

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): HyperliquidWebSocket {
    if (!HyperliquidWebSocket.instance) {
      HyperliquidWebSocket.instance = new HyperliquidWebSocket();
    }
    return HyperliquidWebSocket.instance;
  }

  /**
   * 生成订阅唯一键
   */
  private getSubscriptionKey(subscription: WsSubscription): string {
    return JSON.stringify(subscription);
  }

  /**
   * 连接 WebSocket
   */
  connect(): Promise<void> {
    if (this.isConnected && this.ws) {
      return Promise.resolve();
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve) => {
      this.resolveConnection = resolve;

      this.ws = new ReconnectingWebSocket(WS_URL, [], {
        maxRetries: 10,
        maxReconnectionDelay: 10000,
        minReconnectionDelay: 1000,
        reconnectionDelayGrowFactor: 1.5,
        connectionTimeout: 10000,
      });

      this.ws.onopen = () => {
        console.log('[HyperliquidWS] Connected');
        this.isConnected = true;
        this.startPing();
        
        // 重新订阅所有活跃订阅
        this.resubscribeAll();
        
        // 处理待订阅队列
        this.processPendingSubscriptions();

        if (this.resolveConnection) {
          this.resolveConnection();
          this.resolveConnection = null;
        }
        this.connectionPromise = null;
      };

      this.ws.onclose = () => {
        console.log('[HyperliquidWS] Disconnected');
        this.isConnected = false;
        this.stopPing();
      };

      this.ws.onerror = (error) => {
        console.error('[HyperliquidWS] Error:', error);
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };
    });

    return this.connectionPromise;
  }

  /**
   * 断开 WebSocket
   */
  disconnect(): void {
    this.stopPing();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.subscriptions.clear();
    this.pendingSubscriptions = [];
    this.connectionPromise = null;
    this.resolveConnection = null;
  }

  /**
   * 开始心跳
   */
  private startPing(): void {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      if (this.ws && this.isConnected) {
        this.ws.send(JSON.stringify({ method: 'ping' }));
      }
    }, WS_PING_INTERVAL);
  }

  /**
   * 停止心跳
   */
  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * 重新订阅所有活跃订阅
   */
  private resubscribeAll(): void {
    for (const [, sub] of this.subscriptions) {
      this.sendSubscription(sub.subscription, 'subscribe');
    }
  }

  /**
   * 处理待订阅队列
   */
  private processPendingSubscriptions(): void {
    while (this.pendingSubscriptions.length > 0) {
      const sub = this.pendingSubscriptions.shift();
      if (sub) {
        this.sendSubscription(sub, 'subscribe');
      }
    }
  }

  /**
   * 发送订阅/取消订阅请求
   */
  private sendSubscription(subscription: WsSubscription, method: 'subscribe' | 'unsubscribe'): void {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify({
        method,
        subscription,
      }));
    }
  }

  /**
   * 处理收到的消息
   */
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data) as WsMessage;

      // 忽略 pong 响应
      if (message.channel === 'pong') {
        return;
      }

      // 分发消息到对应的订阅
      for (const [key, sub] of this.subscriptions) {
        if (this.matchesSubscription(message, sub.subscription)) {
          sub.callbacks.forEach((callback) => {
            try {
              callback(message.data);
            } catch (error) {
              console.error('[HyperliquidWS] Callback error:', error);
            }
          });
        }
      }
    } catch (error) {
      console.error('[HyperliquidWS] Message parse error:', error);
    }
  }

  /**
   * 检查消息是否匹配订阅
   */
  private matchesSubscription(message: WsMessage, subscription: WsSubscription): boolean {
    const channel = message.channel;
    const type = subscription.type;

    // 简单匹配：channel 包含 type
    if (channel.includes(type)) {
      // 对于需要匹配 coin 的订阅，检查 coin 是否匹配
      if ('coin' in subscription && typeof message.data === 'object' && message.data !== null) {
        const data = message.data as { coin?: string };
        return data.coin === subscription.coin;
      }
      // 对于用户订阅，检查用户地址
      if ('user' in subscription) {
        // 用户相关的消息通常包含在正确的 channel 中
        return true;
      }
      return true;
    }

    return false;
  }

  /**
   * 订阅
   */
  subscribe<T>(subscription: WsSubscription, callback: SubscriptionCallback<T>): () => void {
    const key = this.getSubscriptionKey(subscription);

    // 获取或创建订阅
    let sub = this.subscriptions.get(key);
    if (!sub) {
      sub = {
        subscription,
        callbacks: new Set(),
      };
      this.subscriptions.set(key, sub);

      // 发送订阅请求
      if (this.isConnected) {
        this.sendSubscription(subscription, 'subscribe');
      } else {
        this.pendingSubscriptions.push(subscription);
        this.connect();
      }
    }

    // 添加回调
    sub.callbacks.add(callback as SubscriptionCallback);

    // 返回取消订阅函数
    return () => {
      if (sub) {
        sub.callbacks.delete(callback as SubscriptionCallback);
        // 如果没有回调了，取消订阅
        if (sub.callbacks.size === 0) {
          this.subscriptions.delete(key);
          if (this.isConnected) {
            this.sendSubscription(subscription, 'unsubscribe');
          }
        }
      }
    };
  }

  // ==================== 便捷订阅方法 ====================

  /**
   * 订阅订单簿
   */
  subscribeL2Book(coin: string, callback: SubscriptionCallback<WsL2BookData>): () => void {
    const subscription: WsL2BookSubscription = {
      type: 'l2Book',
      coin,
    };
    return this.subscribe(subscription, callback);
  }

  /**
   * 订阅成交记录
   */
  subscribeTrades(coin: string, callback: SubscriptionCallback<WsTradeData[]>): () => void {
    const subscription: WsTradesSubscription = {
      type: 'trades',
      coin,
    };
    return this.subscribe(subscription, callback);
  }

  /**
   * 订阅 K 线数据
   */
  subscribeCandle(coin: string, interval: string, callback: SubscriptionCallback<WsCandleData>): () => void {
    const subscription: WsCandleSubscription = {
      type: 'candle',
      coin,
      interval,
    };
    return this.subscribe(subscription, callback);
  }

  /**
   * 订阅所有中间价
   */
  subscribeAllMids(callback: SubscriptionCallback<WsAllMidsData>): () => void {
    const subscription: WsAllMidsSubscription = {
      type: 'allMids',
    };
    return this.subscribe(subscription, callback);
  }

  /**
   * 订阅用户事件 (综合)
   */
  subscribeUserEvents(user: string, callback: SubscriptionCallback<unknown>): () => void {
    const subscription: WsUserEventsSubscription = {
      type: 'userEvents',
      user: user.toLowerCase(),
    };
    return this.subscribe(subscription, callback);
  }

  /**
   * 订阅订单更新
   */
  subscribeOrderUpdates(user: string, callback: SubscriptionCallback<unknown>): () => void {
    const subscription: WsOrderUpdatesSubscription = {
      type: 'orderUpdates',
      user: user.toLowerCase(),
    };
    return this.subscribe(subscription, callback);
  }

  /**
   * 订阅用户成交
   */
  subscribeUserFills(user: string, callback: SubscriptionCallback<unknown>): () => void {
    const subscription: WsUserFillsSubscription = {
      type: 'userFills',
      user: user.toLowerCase(),
    };
    return this.subscribe(subscription, callback);
  }
}

// 导出单例
export const hyperliquidWs = HyperliquidWebSocket.getInstance();
