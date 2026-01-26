import type { WalletClient, Account } from 'viem';
import { HttpClient } from '../utils/http-client';
import {
  signL1Action,
  signApproveBuilderFee,
  signUsdSend,
  signWithdraw3,
  signSpotSend,
  signUsdClassTransfer,
} from '../utils/signer';
import { formatPrice, formatSize, nowMs, normalizeAddress } from '../utils/helpers';
import { HYPERLIQUID_CHAIN, CONFIG } from '../config';
import type {
  OrderRequest,
  OrderAction,
  CancelAction,
  ModifyAction,
  UpdateLeverageAction,
  UsdClassTransferAction,
  VaultDepositAction,
  VaultWithdrawAction,
  LimitOrderType,
  OrderResponse,
  CancelResponse,
  SuccessResponse,
  ExchangeResponse,
} from '../types/exchange';

/**
 * Builder 配置
 */
export interface BuilderConfig {
  address: string;
  feeRate: number; // 基点 (10 = 0.1%)
}

/**
 * HyperLiquid Exchange API 客户端
 * 所有交易接口的封装（含自动签名）
 */
export class ExchangeAPI {
  private client: HttpClient;
  private walletClient: WalletClient;
  private account: Account;

  constructor(client: HttpClient, walletClient: WalletClient, account: Account) {
    this.client = client;
    this.walletClient = walletClient;
    this.account = account;
  }

  // ============================================================
  // 订单操作
  // ============================================================

  /**
   * 下单
   * @param orders 订单列表
   * @param grouping 订单分组类型
   * @param builder Builder 配置 (可选)
   */
  async placeOrder(
    orders: Array<{
      asset: number;
      isBuy: boolean;
      price: string | number;
      size: string | number;
      reduceOnly?: boolean;
      tif?: 'Gtc' | 'Ioc' | 'Alo';
      cloid?: string;
    }>,
    grouping: 'na' | 'normalTpsl' | 'positionTpsl' = 'na',
    builder?: BuilderConfig
  ): Promise<OrderResponse> {
    const orderRequests: OrderRequest[] = orders.map((o) => ({
      a: o.asset,
      b: o.isBuy,
      p: formatPrice(o.price),
      s: formatSize(o.size),
      r: o.reduceOnly ?? false,
      t: {
        limit: { tif: o.tif ?? 'Gtc' },
      } as LimitOrderType,
      ...(o.cloid && { c: o.cloid }),
    }));

    const action: OrderAction = {
      type: 'order',
      orders: orderRequests,
      grouping,
      ...(builder && {
        builder: {
          b: normalizeAddress(builder.address),
          f: builder.feeRate,
        },
      }),
    };

    const nonce = nowMs();
    const signature = await signL1Action(
      this.walletClient,
      this.account,
      action,
      nonce
    );

    return this.client.exchange<OrderResponse>({
      action,
      nonce,
      signature,
    });
  }

  /**
   * 撤销订单
   * @param cancels 撤销列表 [{asset, oid}]
   */
  async cancelOrder(
    cancels: Array<{ asset: number; oid: number }>
  ): Promise<CancelResponse> {
    const action: CancelAction = {
      type: 'cancel',
      cancels: cancels.map((c) => ({ a: c.asset, o: c.oid })),
    };

    const nonce = nowMs();
    const signature = await signL1Action(
      this.walletClient,
      this.account,
      action,
      nonce
    );

    return this.client.exchange<CancelResponse>({
      action,
      nonce,
      signature,
    });
  }

  /**
   * 修改订单
   * @param oid 订单 ID
   * @param newOrder 新订单参数
   */
  async modifyOrder(
    oid: number,
    newOrder: {
      asset: number;
      isBuy: boolean;
      price: string | number;
      size: string | number;
      reduceOnly?: boolean;
      tif?: 'Gtc' | 'Ioc' | 'Alo';
    }
  ): Promise<ExchangeResponse> {
    const orderRequest: OrderRequest = {
      a: newOrder.asset,
      b: newOrder.isBuy,
      p: formatPrice(newOrder.price),
      s: formatSize(newOrder.size),
      r: newOrder.reduceOnly ?? false,
      t: {
        limit: { tif: newOrder.tif ?? 'Gtc' },
      } as LimitOrderType,
    };

    const action: ModifyAction = {
      type: 'modify',
      oid,
      order: orderRequest,
    };

    const nonce = nowMs();
    const signature = await signL1Action(
      this.walletClient,
      this.account,
      action,
      nonce
    );

    return this.client.exchange<ExchangeResponse>({
      action,
      nonce,
      signature,
    });
  }

  // ============================================================
  // 账户操作
  // ============================================================

  /**
   * 更新杠杆
   * @param asset 资产索引
   * @param leverage 杠杆倍数
   * @param isCross 是否全仓模式
   */
  async updateLeverage(
    asset: number,
    leverage: number,
    isCross: boolean = true
  ): Promise<ExchangeResponse> {
    // 注意: 字段顺序必须与 Python SDK 一致: type, asset, isCross, leverage
    const action: UpdateLeverageAction = {
      type: 'updateLeverage',
      asset,
      isCross,
      leverage,
    };

    const nonce = nowMs();
    const signature = await signL1Action(
      this.walletClient,
      this.account,
      action,
      nonce
    );

    return this.client.exchange<ExchangeResponse>({
      action,
      nonce,
      signature,
    });
  }

  /**
   * 永续与现货之间转账
   * @param amount 金额
   * @param toPerp true=转到永续, false=转到现货
   */
  async usdClassTransfer(
    amount: string | number,
    toPerp: boolean
  ): Promise<ExchangeResponse> {
    const nonce = nowMs();
    const amountStr = formatPrice(amount);

    const signature = await signUsdClassTransfer(
      this.walletClient,
      this.account,
      amountStr,
      toPerp,
      nonce
    );

    const action = {
      type: 'usdClassTransfer' as const,
      hyperliquidChain: HYPERLIQUID_CHAIN,
      signatureChainId: `0x${CONFIG.CHAIN_ID.toString(16)}`,
      amount: amountStr,
      toPerp,
      nonce,
    };

    return this.client.exchange<ExchangeResponse>({
      action,
      nonce,
      signature,
    });
  }

  // ============================================================
  // Vault 操作
  // ============================================================

  /**
   * 存入 Vault
   */
  async vaultDeposit(vaultAddress: string, usd: number): Promise<ExchangeResponse> {
    const action: VaultDepositAction = {
      type: 'vaultDeposit',
      vaultAddress: normalizeAddress(vaultAddress),
      usd,
    };

    const nonce = nowMs();
    const signature = await signL1Action(
      this.walletClient,
      this.account,
      action,
      nonce
    );

    return this.client.exchange<ExchangeResponse>({
      action,
      nonce,
      signature,
    });
  }

  /**
   * 从 Vault 取出
   */
  async vaultWithdraw(vaultAddress: string, usd: number): Promise<ExchangeResponse> {
    const action: VaultWithdrawAction = {
      type: 'vaultWithdraw',
      vaultAddress: normalizeAddress(vaultAddress),
      usd,
    };

    const nonce = nowMs();
    const signature = await signL1Action(
      this.walletClient,
      this.account,
      action,
      nonce
    );

    return this.client.exchange<ExchangeResponse>({
      action,
      nonce,
      signature,
    });
  }

  // ============================================================
  // Builder 授权
  // ============================================================

  /**
   * 授权 Builder 费率
   * @param builder Builder 地址
   * @param maxFeeRate 最大费率 (基点字符串, 如 "10" = 0.1%)
   */
  async approveBuilderFee(
    builder: string,
    maxFeeRate: string
  ): Promise<ExchangeResponse> {
    const nonce = nowMs();

    // 将基点转换为百分比格式: 10 bps = 0.1% -> "0.1%"
    const feeRateBps = parseInt(maxFeeRate, 10);
    const feeRatePercent = `${feeRateBps / 100}%`;

    const signature = await signApproveBuilderFee(
      this.walletClient,
      this.account,
      builder,
      feeRatePercent,
      nonce
    );

    const action = {
      type: 'approveBuilderFee' as const,
      hyperliquidChain: HYPERLIQUID_CHAIN,
      signatureChainId: `0x${CONFIG.CHAIN_ID.toString(16)}`,
      maxFeeRate: feeRatePercent,
      builder: normalizeAddress(builder),
      nonce,
    };

    return this.client.exchange<ExchangeResponse>({
      action,
      nonce,
      signature,
    });
  }

  // ============================================================
  // 资金操作
  // ============================================================

  /**
   * USDC 转账 (L2 内部)
   * @param destination 目标地址
   * @param amount 金额
   */
  async usdSend(destination: string, amount: string): Promise<ExchangeResponse> {
    const time = nowMs();
    const signature = await signUsdSend(
      this.walletClient,
      this.account,
      destination,
      amount,
      time
    );

    const action = {
      type: 'usdSend' as const,
      hyperliquidChain: HYPERLIQUID_CHAIN,
      signatureChainId: `0x${CONFIG.CHAIN_ID.toString(16)}`,
      destination: normalizeAddress(destination),
      amount,
      time,
    };

    return this.client.exchange<ExchangeResponse>({
      action,
      nonce: time,
      signature,
    });
  }

  /**
   * 提现到 L1
   * @param destination 目标地址
   * @param amount 金额
   */
  async withdraw3(destination: string, amount: string): Promise<ExchangeResponse> {
    const time = nowMs();
    const signature = await signWithdraw3(
      this.walletClient,
      this.account,
      destination,
      amount,
      time
    );

    const action = {
      type: 'withdraw3' as const,
      hyperliquidChain: HYPERLIQUID_CHAIN,
      signatureChainId: `0x${CONFIG.CHAIN_ID.toString(16)}`,
      destination: normalizeAddress(destination),
      amount,
      time,
    };

    return this.client.exchange<ExchangeResponse>({
      action,
      nonce: time,
      signature,
    });
  }

  /**
   * 现货转账
   * @param destination 目标地址
   * @param token 代币名称
   * @param amount 金额
   */
  async spotSend(
    destination: string,
    token: string,
    amount: string
  ): Promise<ExchangeResponse> {
    const time = nowMs();
    const signature = await signSpotSend(
      this.walletClient,
      this.account,
      destination,
      token,
      amount,
      time
    );

    const action = {
      type: 'spotSend' as const,
      hyperliquidChain: HYPERLIQUID_CHAIN,
      signatureChainId: `0x${CONFIG.CHAIN_ID.toString(16)}`,
      destination: normalizeAddress(destination),
      token,
      amount,
      time,
    };

    return this.client.exchange<ExchangeResponse>({
      action,
      nonce: time,
      signature,
    });
  }
}
