import { HttpClient } from '../utils/http-client';
import type {
  MetaResponse,
  MetaAndAssetCtxsResponse,
  L2BookResponse,
  CandleSnapshotResponse,
  RecentTradesResponse,
  AllMidsResponse,
  ClearinghouseStateResponse,
  OpenOrdersResponse,
  FrontendOpenOrdersResponse,
  SpotMetaResponse,
  SpotMetaAndAssetCtxsResponse,
  SpotClearinghouseStateResponse,
  TokenDetailsResponse,
  HistoricalOrdersResponse,
  UserFillsResponse,
  UserFundingResponse,
  UserNonFundingLedgerUpdatesResponse,
  MaxBuilderFeeResponse,
  UserRateLimitResponse,
  OrderStatusResponse,
  ReferralResponse,
  SubAccountsResponse,
  VaultDetailsResponse,
  UserVaultEquitiesResponse,
  PredictedFundingsResponse,
  FundingHistoryResponse,
} from '../types/info';

/**
 * HyperLiquid Info API 客户端
 * 所有查询接口的封装
 */
export class InfoAPI {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  // ============================================================
  // 永续合约元数据
  // ============================================================

  /** 获取永续合约元数据 */
  async meta(): Promise<MetaResponse> {
    return this.client.info<MetaResponse>({ type: 'meta' });
  }

  /** 获取永续合约元数据 + 实时上下文 */
  async metaAndAssetCtxs(): Promise<MetaAndAssetCtxsResponse> {
    return this.client.info<MetaAndAssetCtxsResponse>({ type: 'metaAndAssetCtxs' });
  }

  // ============================================================
  // 现货元数据
  // ============================================================

  /** 获取现货代币和市场元数据 */
  async spotMeta(): Promise<SpotMetaResponse> {
    return this.client.info<SpotMetaResponse>({ type: 'spotMeta' });
  }

  /** 获取现货元数据 + 实时上下文 */
  async spotMetaAndAssetCtxs(): Promise<SpotMetaAndAssetCtxsResponse> {
    return this.client.info<SpotMetaAndAssetCtxsResponse>({ type: 'spotMetaAndAssetCtxs' });
  }

  // ============================================================
  // 市场数据
  // ============================================================

  /** 获取订单簿 */
  async l2Book(coin: string, nSigFigs?: number, mantissa?: number): Promise<L2BookResponse> {
    return this.client.info<L2BookResponse>({
      type: 'l2Book',
      coin,
      ...(nSigFigs && { nSigFigs }),
      ...(mantissa && { mantissa }),
    });
  }

  /** 获取K线数据 */
  async candleSnapshot(
    coin: string,
    interval: string,
    startTime: number,
    endTime: number
  ): Promise<CandleSnapshotResponse> {
    return this.client.info<CandleSnapshotResponse>({
      type: 'candleSnapshot',
      req: { coin, interval, startTime, endTime },
    });
  }

  /** 获取最近成交 */
  async recentTrades(coin: string): Promise<RecentTradesResponse> {
    return this.client.info<RecentTradesResponse>({ type: 'recentTrades', coin });
  }

  /** 获取所有中间价 */
  async allMids(): Promise<AllMidsResponse> {
    return this.client.info<AllMidsResponse>({ type: 'allMids' });
  }

  // ============================================================
  // 用户账户
  // ============================================================

  /** 获取永续账户状态 */
  async clearinghouseState(user: string): Promise<ClearinghouseStateResponse> {
    return this.client.info<ClearinghouseStateResponse>({
      type: 'clearinghouseState',
      user,
    });
  }

  /** 获取现货账户状态 */
  async spotClearinghouseState(user: string): Promise<SpotClearinghouseStateResponse> {
    return this.client.info<SpotClearinghouseStateResponse>({
      type: 'spotClearinghouseState',
      user,
    });
  }

  /** 获取代币详情 */
  async tokenDetails(tokenId: string): Promise<TokenDetailsResponse> {
    return this.client.info<TokenDetailsResponse>({ type: 'tokenDetails', tokenId });
  }

  // ============================================================
  // 订单
  // ============================================================

  /** 获取当前挂单 */
  async openOrders(user: string): Promise<OpenOrdersResponse> {
    return this.client.info<OpenOrdersResponse>({ type: 'openOrders', user });
  }

  /** 获取前端挂单详情 */
  async frontendOpenOrders(user: string): Promise<FrontendOpenOrdersResponse> {
    return this.client.info<FrontendOpenOrdersResponse>({
      type: 'frontendOpenOrders',
      user,
    });
  }

  /** 获取订单状态 */
  async orderStatus(user: string, oid: number): Promise<OrderStatusResponse> {
    return this.client.info<OrderStatusResponse>({ type: 'orderStatus', user, oid });
  }

  // ============================================================
  // 历史记录
  // ============================================================

  /** 获取历史订单 */
  async historicalOrders(user: string): Promise<HistoricalOrdersResponse> {
    return this.client.info<HistoricalOrdersResponse>({ type: 'historicalOrders', user });
  }

  /** 获取用户成交记录 */
  async userFills(user: string, aggregateByTime?: boolean): Promise<UserFillsResponse> {
    return this.client.info<UserFillsResponse>({
      type: 'userFills',
      user,
      ...(aggregateByTime !== undefined && { aggregateByTime }),
    });
  }

  /** 获取用户指定时间范围的成交记录 */
  async userFillsByTime(
    user: string,
    startTime: number,
    endTime?: number,
    aggregateByTime?: boolean
  ): Promise<UserFillsResponse> {
    return this.client.info<UserFillsResponse>({
      type: 'userFillsByTime',
      user,
      startTime,
      ...(endTime && { endTime }),
      ...(aggregateByTime !== undefined && { aggregateByTime }),
    });
  }

  /** 获取用户资金费率历史 */
  async userFunding(
    user: string,
    startTime?: number,
    endTime?: number
  ): Promise<UserFundingResponse> {
    return this.client.info<UserFundingResponse>({
      type: 'userFunding',
      user,
      ...(startTime && { startTime }),
      ...(endTime && { endTime }),
    });
  }

  /** 获取用户账本更新 (非资金费) */
  async userNonFundingLedgerUpdates(
    user: string,
    startTime?: number,
    endTime?: number
  ): Promise<UserNonFundingLedgerUpdatesResponse> {
    return this.client.info<UserNonFundingLedgerUpdatesResponse>({
      type: 'userNonFundingLedgerUpdates',
      user,
      ...(startTime && { startTime }),
      ...(endTime && { endTime }),
    });
  }

  // ============================================================
  // Builder / 推荐
  // ============================================================

  /**
   * 查询 Builder 授权状态
   * @returns 返回授权费率（基点）
   */
  async maxBuilderFee(user: string, builder: string): Promise<number> {
    const response = await this.client.info<number>({
      type: 'maxBuilderFee',
      user,
      builder,
    });
    // API 返回 percentage * 1000，转换为基点 (bps)
    // 例如: 100 (API) = 0.1% = 10 bps
    return response / 10;
  }

  /** 获取用户 API 速率限制 */
  async userRateLimit(user: string): Promise<UserRateLimitResponse> {
    return this.client.info<UserRateLimitResponse>({ type: 'userRateLimit', user });
  }

  /** 获取推荐状态 */
  async referral(user: string): Promise<ReferralResponse> {
    return this.client.info<ReferralResponse>({ type: 'referral', user });
  }

  // ============================================================
  // 子账户 / Vault
  // ============================================================

  /** 获取子账户列表 */
  async subAccounts(user: string): Promise<SubAccountsResponse> {
    return this.client.info<SubAccountsResponse>({ type: 'subAccounts', user });
  }

  /** 获取 Vault 详情 */
  async vaultDetails(vaultAddress: string): Promise<VaultDetailsResponse> {
    return this.client.info<VaultDetailsResponse>({ type: 'vaultDetails', vaultAddress });
  }

  /** 获取用户 Vault 权益 */
  async userVaultEquities(user: string): Promise<UserVaultEquitiesResponse> {
    return this.client.info<UserVaultEquitiesResponse>({ type: 'userVaultEquities', user });
  }

  // ============================================================
  // 资金费率
  // ============================================================

  /** 获取预测资金费率 */
  async predictedFundings(): Promise<PredictedFundingsResponse> {
    return this.client.info<PredictedFundingsResponse>({ type: 'predictedFundings' });
  }

  /** 获取历史资金费率 */
  async fundingHistory(
    coin: string,
    startTime: number,
    endTime?: number
  ): Promise<FundingHistoryResponse> {
    return this.client.info<FundingHistoryResponse>({
      type: 'fundingHistory',
      coin,
      startTime,
      ...(endTime && { endTime }),
    });
  }
}
