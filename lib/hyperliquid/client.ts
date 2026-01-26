/**
 * HyperLiquid REST API 客户端
 */

import {
  API_URL,
  CURRENT_NETWORK,
  BUILDER_ADDRESS,
  BUILDER_FEE_PERP,
  IS_TESTNET,
} from './constants';
import type {
  MetaAndAssetCtxs,
  ClearinghouseState,
  SpotClearinghouseState,
  L2Book,
  Candle,
  Trade,
  Order,
  OpenOrders,
  UserFill,
  FundingHistory,
  HistoricalOrder,
  PlaceOrderAction,
  CancelOrderAction,
  CancelByCloidAction,
  ModifyOrderAction,
  BatchModifyAction,
  UpdateLeverageAction,
  UpdateIsolatedMarginAction,
  ApproveBuilderFeeAction,
  ExchangeResponse,
  OrderWire,
  TIF,
  MaxBuilderFee,
  SpotMeta,
  PlaceTwapOrderAction,
  CancelTwapOrderAction,
  TwapOrderWire,
  TwapOrder,
  TwapOrderResponse,
  TwapCancelResponse,
} from './types';
import { normalizeAddress, generateNonce } from './utils';
import { signL1Action, signUserSignedAction, parseSignature } from './signing';

/**
 * HyperLiquid Info API 客户端
 * 用于查询数据
 */
export class HyperliquidInfoClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * 发送 POST 请求到 /info 端点
   */
  private async post<T>(body: Record<string, unknown>): Promise<T> {
    const response = await fetch(`${this.baseUrl}/info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * 获取所有永续合约元数据和实时数据
   */
  async getMetaAndAssetCtxs(): Promise<MetaAndAssetCtxs> {
    const result = await this.post<
      [{ universe: MetaAndAssetCtxs['universe'] }, MetaAndAssetCtxs['assetCtxs']]
    >({
      type: 'metaAndAssetCtxs',
    });
    return {
      universe: result[0].universe,
      assetCtxs: result[1],
    };
  }

  /**
   * 获取永续合约元数据
   */
  async getPerpMeta(): Promise<MetaAndAssetCtxs['universe']> {
    const result = await this.post<{ universe: MetaAndAssetCtxs['universe'] }>({
      type: 'meta',
    });
    return result.universe;
  }

  /**
   * 获取现货元数据
   */
  async getSpotMeta(): Promise<SpotMeta> {
    return this.post<SpotMeta>({
      type: 'spotMeta',
    });
  }

  /**
   * 获取现货元数据和余额上下文
   */
  async getSpotMetaAndAssetCtxs(): Promise<[SpotMeta, unknown[]]> {
    return this.post<[SpotMeta, unknown[]]>({
      type: 'spotMetaAndAssetCtxs',
    });
  }

  /**
   * 获取用户永续合约账户状态 (余额、持仓等)
   */
  async getClearinghouseState(user: string): Promise<ClearinghouseState> {
    return this.post<ClearinghouseState>({
      type: 'clearinghouseState',
      user: normalizeAddress(user),
    });
  }

  /**
   * 获取用户现货账户状态
   */
  async getSpotClearinghouseState(user: string): Promise<SpotClearinghouseState> {
    return this.post<SpotClearinghouseState>({
      type: 'spotClearinghouseState',
      user: normalizeAddress(user),
    });
  }

  /**
   * 获取订单簿
   */
  async getL2Book(coin: string, nSigFigs?: number): Promise<L2Book> {
    const body: Record<string, unknown> = {
      type: 'l2Book',
      coin,
    };
    if (nSigFigs !== undefined) {
      body.nSigFigs = nSigFigs;
    }
    return this.post<L2Book>(body);
  }

  /**
   * 获取 K 线数据
   */
  async getCandleSnapshot(
    coin: string,
    interval: string,
    startTime: number,
    endTime?: number
  ): Promise<Candle[]> {
    const body: Record<string, unknown> = {
      type: 'candleSnapshot',
      req: {
        coin,
        interval,
        startTime,
        endTime: endTime || Date.now(),
      },
    };
    return this.post<Candle[]>(body);
  }

  /**
   * 获取最近成交记录
   */
  async getRecentTrades(coin: string): Promise<Trade[]> {
    return this.post<Trade[]>({
      type: 'recentTrades',
      coin,
    });
  }

  /**
   * 获取用户当前挂单
   */
  async getOpenOrders(user: string): Promise<Order[]> {
    return this.post<Order[]>({
      type: 'openOrders',
      user: normalizeAddress(user),
    });
  }

  /**
   * 获取用户指定交易对的挂单
   */
  async getFrontendOpenOrders(user: string): Promise<OpenOrders[]> {
    return this.post<OpenOrders[]>({
      type: 'frontendOpenOrders',
      user: normalizeAddress(user),
    });
  }

  /**
   * 获取用户成交记录
   */
  async getUserFills(user: string, aggregateByTime?: boolean): Promise<UserFill[]> {
    return this.post<UserFill[]>({
      type: 'userFills',
      user: normalizeAddress(user),
      aggregateByTime,
    });
  }

  /**
   * 获取用户指定交易对的成交记录
   */
  async getUserFillsByTime(
    user: string,
    startTime: number,
    endTime?: number,
    aggregateByTime?: boolean
  ): Promise<UserFill[]> {
    return this.post<UserFill[]>({
      type: 'userFillsByTime',
      user: normalizeAddress(user),
      startTime,
      endTime,
      aggregateByTime,
    });
  }

  /**
   * 获取资金费率历史
   */
  async getFundingHistory(
    coin: string,
    startTime: number,
    endTime?: number
  ): Promise<FundingHistory[]> {
    return this.post<FundingHistory[]>({
      type: 'fundingHistory',
      coin,
      startTime,
      endTime,
    });
  }

  /**
   * 获取用户授权的最大 Builder 费率
   */
  async getMaxBuilderFee(user: string, builder: string): Promise<number> {
    const result = await this.post<MaxBuilderFee>({
      type: 'maxBuilderFee',
      user: normalizeAddress(user),
      builder: normalizeAddress(builder),
    });
    return result[normalizeAddress(builder)] || 0;
  }

  /**
   * 获取用户历史订单
   */
  async getOrderHistory(user: string): Promise<HistoricalOrder[]> {
    return this.post<HistoricalOrder[]>({
      type: 'historicalOrders',
      user: normalizeAddress(user),
    });
  }

  /**
   * 查询订单状态
   */
  async getOrderStatus(user: string, oid: number): Promise<Order | null> {
    const result = await this.post<{ order: Order } | null>({
      type: 'orderStatus',
      user: normalizeAddress(user),
      oid,
    });
    return result?.order || null;
  }

  /**
   * 获取所有中间价
   */
  async getAllMids(): Promise<Record<string, string>> {
    return this.post<Record<string, string>>({
      type: 'allMids',
    });
  }

  /**
   * 获取用户资金费率历史
   */
  async getUserFunding(user: string, startTime: number, endTime?: number): Promise<unknown[]> {
    return this.post<unknown[]>({
      type: 'userFunding',
      user: normalizeAddress(user),
      startTime,
      endTime,
    });
  }

  /**
   * 获取用户非资金费率记录
   */
  async getUserNonFundingLedgerUpdates(
    user: string,
    startTime: number,
    endTime?: number
  ): Promise<unknown[]> {
    return this.post<unknown[]>({
      type: 'userNonFundingLedgerUpdates',
      user: normalizeAddress(user),
      startTime,
      endTime,
    });
  }

  /**
   * 获取用户 TWAP 订单状态
   */
  async getTwapHistory(user: string): Promise<TwapOrder[]> {
    return this.post<TwapOrder[]>({
      type: 'twapHistory',
      user: normalizeAddress(user),
    });
  }

  /**
   * 获取用户当前活跃的 TWAP 订单
   */
  async getActiveTwapOrders(user: string): Promise<TwapOrder[]> {
    const history = await this.getTwapHistory(user);
    return history.filter((order) => order.state.running);
  }
}

/**
 * HyperLiquid Exchange API 客户端
 * 用于交易操作
 */
export class HyperliquidExchangeClient {
  private baseUrl: string;
  private infoClient: HyperliquidInfoClient;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
    this.infoClient = new HyperliquidInfoClient(baseUrl);
  }

  /**
   * 发送签名请求到 /exchange 端点
   * 所有 Exchange API 都需要 {r, s, v} 格式的签名
   */
  private async postSigned<T extends object>(
    action: T,
    signature: string,
    nonce: number,
    vaultAddress?: string
  ): Promise<ExchangeResponse> {
    // 解析签名为 {r, s, v} 格式
    const parsedSig = parseSignature(signature);

    const body: Record<string, unknown> = {
      action: action as Record<string, unknown>,
      nonce,
      signature: parsedSig,
    };

    if (vaultAddress) {
      body.vaultAddress = vaultAddress;
    }

    console.log('[postSigned] Request:', JSON.stringify(body, null, 2));

    const response = await fetch(`${this.baseUrl}/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[postSigned] Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    return response.json();
  }

  /**
   * 发送用户签名操作到 /exchange 端点
   * 使用 {r, s, v} 格式的签名 (approveBuilderFee 等)
   */
  private async postUserSignedAction<T extends object>(
    action: T,
    signature: string,
    nonce: number
  ): Promise<ExchangeResponse> {
    const parsedSig = parseSignature(signature);

    const body = {
      action: action as Record<string, unknown>,
      nonce,
      signature: parsedSig,
    };

    const response = await fetch(`${this.baseUrl}/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[postUserSignedAction] Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    return response.json();
  }

  /**
   * 检查并授权 Builder Fee
   */
  async checkAndApproveBuilderFee(
    user: string,
    signTypedData: (params: {
      domain: Record<string, unknown>;
      types: Record<string, unknown>;
      primaryType: string;
      message: Record<string, unknown>;
    }) => Promise<string>
  ): Promise<boolean> {
    const currentFee = await this.infoClient.getMaxBuilderFee(user, BUILDER_ADDRESS);
    const requiredFee = BUILDER_FEE_PERP;

    // 如果已授权且费率足够，无需重新授权
    if (currentFee >= requiredFee) {
      return true;
    }

    // 需要授权
    const nonce = generateNonce();
    // BUILDER_FEE_PERP 单位是 basis point (bp)，1 bp = 0.01%
    // 例如: requiredFee = 1 -> maxFeeRate = "0.01%"
    const feePercent = requiredFee * 0.01;
    const action: ApproveBuilderFeeAction = {
      type: 'approveBuilderFee',
      hyperliquidChain: CURRENT_NETWORK.isTestnet ? 'Testnet' : 'Mainnet',
      signatureChainId: CURRENT_NETWORK.signatureChainId,
      maxFeeRate: `${feePercent}%`,
      builder: BUILDER_ADDRESS.toLowerCase(), // Builder 地址必须小写
      nonce,
    };

    const signature = await signUserSignedAction(action, signTypedData, CURRENT_NETWORK.isTestnet);
    // approveBuilderFee 使用 {r, s, v} 格式的签名
    const response = await this.postUserSignedAction(action, signature, nonce);

    return response.status === 'ok';
  }

  /**
   * 下单
   */
  async placeOrder(
    orders: Array<{
      coin: string;
      assetId: number;
      isBuy: boolean;
      limitPx: string;
      sz: string;
      reduceOnly?: boolean;
      orderType?: {
        limit?: { tif: TIF };
        trigger?: {
          isMarket: boolean;
          triggerPx: string;
          tpsl: 'tp' | 'sl';
        };
      };
      cloid?: string;
    }>,
    signTypedData: (params: {
      domain: Record<string, unknown>;
      types: Record<string, unknown>;
      primaryType: string;
      message: Record<string, unknown>;
    }) => Promise<string>,
    grouping: 'na' | 'normalTpsl' | 'positionTpsl' = 'na'
  ): Promise<ExchangeResponse> {
    const orderWires: OrderWire[] = orders.map((order) => ({
      a: order.assetId,
      b: order.isBuy,
      p: order.limitPx,
      s: order.sz,
      r: order.reduceOnly ?? false,
      t: order.orderType || { limit: { tif: 'Gtc' as TIF } },
      c: order.cloid,
    }));

    const action: PlaceOrderAction = {
      type: 'order',
      orders: orderWires,
      grouping,
      builder: {
        b: BUILDER_ADDRESS,
        f: BUILDER_FEE_PERP,
      },
    };

    const nonce = generateNonce();
    const signature = await signL1Action(action, nonce, signTypedData, null, IS_TESTNET);

    return this.postSigned(action, signature, nonce);
  }

  /**
   * 市价单
   */
  async placeMarketOrder(
    coin: string,
    assetId: number,
    isBuy: boolean,
    sz: string,
    slippagePrice: string,
    reduceOnly: boolean = false,
    signTypedData: (params: {
      domain: Record<string, unknown>;
      types: Record<string, unknown>;
      primaryType: string;
      message: Record<string, unknown>;
    }) => Promise<string>
  ): Promise<ExchangeResponse> {
    return this.placeOrder(
      [
        {
          coin,
          assetId,
          isBuy,
          limitPx: slippagePrice,
          sz,
          reduceOnly,
          orderType: { limit: { tif: 'Ioc' } },
        },
      ],
      signTypedData
    );
  }

  /**
   * 撤销订单
   */
  async cancelOrder(
    cancels: Array<{
      assetId: number;
      oid: number;
    }>,
    signTypedData: (params: {
      domain: Record<string, unknown>;
      types: Record<string, unknown>;
      primaryType: string;
      message: Record<string, unknown>;
    }) => Promise<string>
  ): Promise<ExchangeResponse> {
    const action: CancelOrderAction = {
      type: 'cancel',
      cancels: cancels.map((c) => ({
        a: c.assetId,
        o: c.oid,
      })),
    };

    const nonce = generateNonce();
    const signature = await signL1Action(action, nonce, signTypedData, null, IS_TESTNET);

    return this.postSigned(action, signature, nonce);
  }

  /**
   * 通过 cloid 撤销订单
   */
  async cancelOrderByCloid(
    cancels: Array<{
      assetId: number;
      cloid: string;
    }>,
    signTypedData: (params: {
      domain: Record<string, unknown>;
      types: Record<string, unknown>;
      primaryType: string;
      message: Record<string, unknown>;
    }) => Promise<string>
  ): Promise<ExchangeResponse> {
    const action: CancelByCloidAction = {
      type: 'cancelByCloid',
      cancels: cancels.map((c) => ({
        asset: c.assetId,
        cloid: c.cloid,
      })),
    };

    const nonce = generateNonce();
    const signature = await signL1Action(action, nonce, signTypedData, null, IS_TESTNET);

    return this.postSigned(action, signature, nonce);
  }

  /**
   * 修改订单
   */
  async modifyOrder(
    oid: number,
    order: {
      assetId: number;
      isBuy: boolean;
      limitPx: string;
      sz: string;
      reduceOnly?: boolean;
      orderType?: {
        limit?: { tif: TIF };
        trigger?: {
          isMarket: boolean;
          triggerPx: string;
          tpsl: 'tp' | 'sl';
        };
      };
      cloid?: string;
    },
    signTypedData: (params: {
      domain: Record<string, unknown>;
      types: Record<string, unknown>;
      primaryType: string;
      message: Record<string, unknown>;
    }) => Promise<string>
  ): Promise<ExchangeResponse> {
    const action: ModifyOrderAction = {
      type: 'modify',
      oid,
      order: {
        a: order.assetId,
        b: order.isBuy,
        p: order.limitPx,
        s: order.sz,
        r: order.reduceOnly ?? false,
        t: order.orderType || { limit: { tif: 'Gtc' } },
        c: order.cloid,
      },
    };

    const nonce = generateNonce();
    const signature = await signL1Action(action, nonce, signTypedData, null, IS_TESTNET);

    return this.postSigned(action, signature, nonce);
  }

  /**
   * 批量修改订单
   */
  async batchModifyOrders(
    modifies: Array<{
      oid: number;
      order: {
        assetId: number;
        isBuy: boolean;
        limitPx: string;
        sz: string;
        reduceOnly?: boolean;
        orderType?: {
          limit?: { tif: TIF };
        };
        cloid?: string;
      };
    }>,
    signTypedData: (params: {
      domain: Record<string, unknown>;
      types: Record<string, unknown>;
      primaryType: string;
      message: Record<string, unknown>;
    }) => Promise<string>
  ): Promise<ExchangeResponse> {
    const action: BatchModifyAction = {
      type: 'batchModify',
      modifies: modifies.map((m) => ({
        oid: m.oid,
        order: {
          a: m.order.assetId,
          b: m.order.isBuy,
          p: m.order.limitPx,
          s: m.order.sz,
          r: m.order.reduceOnly ?? false,
          t: m.order.orderType || { limit: { tif: 'Gtc' } },
          c: m.order.cloid,
        },
      })),
    };

    const nonce = generateNonce();
    const signature = await signL1Action(action, nonce, signTypedData, null, IS_TESTNET);

    return this.postSigned(action, signature, nonce);
  }

  /**
   * 更新杠杆
   */
  async updateLeverage(
    assetId: number,
    leverage: number,
    isCross: boolean,
    signTypedData: (params: {
      domain: Record<string, unknown>;
      types: Record<string, unknown>;
      primaryType: string;
      message: Record<string, unknown>;
    }) => Promise<string>
  ): Promise<ExchangeResponse> {
    const action: UpdateLeverageAction = {
      type: 'updateLeverage',
      asset: assetId,
      isCross,
      leverage,
    };

    const nonce = generateNonce();
    const signature = await signL1Action(action, nonce, signTypedData, null, IS_TESTNET);

    return this.postSigned(action, signature, nonce);
  }

  /**
   * 更新逐仓保证金
   */
  async updateIsolatedMargin(
    assetId: number,
    isBuy: boolean,
    ntli: number,
    signTypedData: (params: {
      domain: Record<string, unknown>;
      types: Record<string, unknown>;
      primaryType: string;
      message: Record<string, unknown>;
    }) => Promise<string>
  ): Promise<ExchangeResponse> {
    const action: UpdateIsolatedMarginAction = {
      type: 'updateIsolatedMargin',
      asset: assetId,
      isBuy,
      ntli,
    };

    const nonce = generateNonce();
    const signature = await signL1Action(action, nonce, signTypedData, null, IS_TESTNET);

    return this.postSigned(action, signature, nonce);
  }

  /**
   * 下 TWAP 订单
   * @param params TWAP 订单参数
   * @param assetId 资产 ID
   * @param signTypedData 签名函数
   */
  async placeTwapOrder(
    params: {
      assetId: number;
      isBuy: boolean;
      sz: string;
      reduceOnly: boolean;
      minutes: number;
      randomize: boolean;
    },
    signTypedData: (params: {
      domain: Record<string, unknown>;
      types: Record<string, unknown>;
      primaryType: string;
      message: Record<string, unknown>;
    }) => Promise<string>
  ): Promise<TwapOrderResponse> {
    const twapWire: TwapOrderWire = {
      a: params.assetId,
      b: params.isBuy,
      s: params.sz,
      r: params.reduceOnly,
      m: params.minutes,
      t: params.randomize,
    };

    const action: PlaceTwapOrderAction = {
      type: 'twapOrder',
      twap: twapWire,
    };

    const nonce = generateNonce();
    const signature = await signL1Action(action, nonce, signTypedData, null, IS_TESTNET);

    return this.postSigned(action, signature, nonce) as Promise<TwapOrderResponse>;
  }

  /**
   * 取消 TWAP 订单
   * @param assetId 资产 ID
   * @param twapId TWAP 订单 ID
   * @param signTypedData 签名函数
   */
  async cancelTwapOrder(
    assetId: number,
    twapId: number,
    signTypedData: (params: {
      domain: Record<string, unknown>;
      types: Record<string, unknown>;
      primaryType: string;
      message: Record<string, unknown>;
    }) => Promise<string>
  ): Promise<TwapCancelResponse> {
    const action: CancelTwapOrderAction = {
      type: 'twapCancel',
      a: assetId,
      t: twapId,
    };

    const nonce = generateNonce();
    const signature = await signL1Action(action, nonce, signTypedData, null, IS_TESTNET);

    return this.postSigned(action, signature, nonce) as Promise<TwapCancelResponse>;
  }
}

// 导出单例
export const infoClient = new HyperliquidInfoClient();
export const exchangeClient = new HyperliquidExchangeClient();
