import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  getExchangeAPI,
  getInfoAPI,
  canRunExchangeTests,
  getTestUserAddress,
} from '../setup';
import type { ExchangeAPI } from '../../src/api/exchange';
import type { InfoAPI } from '../../src/api/info';
import type { PerpAsset } from '../../src/types/info';

/**
 * OP 永续合约完整交易测试
 *
 * 测试流程:
 * 1. 查询 OP 代币信息
 * 2. 查询账户余额
 * 3. 设置杠杆
 * 4. 下单
 * 5. 查看仓位
 * 6. 撤单清理
 *
 * 所有关键信息输出到控制台
 */
describe('OP Trading Flow', () => {
  let exchangeApi: ExchangeAPI;
  let infoApi: InfoAPI;
  let canRun: boolean;
  let userAddress: string;

  // OP 相关信息
  let opAsset: PerpAsset | undefined;
  let opIndex: number = -1;
  let opPrice: number = 0;

  // 订单信息
  let placedOrderId: number | null = null;

  beforeAll(async () => {
    canRun = canRunExchangeTests();
    if (canRun) {
      exchangeApi = getExchangeAPI();
      infoApi = getInfoAPI();
      userAddress = getTestUserAddress();

      // 获取 OP 信息
      const meta = await infoApi.meta();
      opAsset = meta.universe.find((a) => a.name === 'OP');
      if (opAsset) {
        opIndex = meta.universe.indexOf(opAsset);
      }

      // 获取 OP 当前价格
      const mids = await infoApi.allMids();
      opPrice = parseFloat(mids['OP'] || '0');
    }
  });

  afterAll(async () => {
    // 清理: 撤销所有挂单
    if (canRun && placedOrderId !== null && opIndex >= 0) {
      try {
        console.log('\n========== 清理: 撤销订单 ==========');
        await exchangeApi.cancelOrder([{ asset: opIndex, oid: placedOrderId }]);
        console.log(`已撤销订单 ID: ${placedOrderId}`);
      } catch (e) {
        console.log('撤单失败或订单已不存在');
      }
    }
  });

  describe('1. 查询 OP 代币信息', () => {
    it('should display OP token info', async () => {
      if (!canRun) {
        console.log('跳过测试: 未设置 PRIVATE_KEY');
        return;
      }

      expect(opAsset).toBeDefined();
      expect(opIndex).toBeGreaterThanOrEqual(0);

      console.log('\n========== OP 代币信息 ==========');
      console.log(`名称: ${opAsset!.name}`);
      console.log(`Asset Index: ${opIndex}`);
      console.log(`最大杠杆: ${opAsset!.maxLeverage}x`);
      console.log(`数量精度: ${opAsset!.szDecimals} 位小数`);
      console.log(`仅逐仓: ${opAsset!.onlyIsolated ? '是' : '否'}`);
    });

    it('should display OP current price', async () => {
      if (!canRun) return;

      expect(opPrice).toBeGreaterThan(0);

      // 获取更详细的市场数据
      const [meta, assetCtxs] = await infoApi.metaAndAssetCtxs();
      const opCtx = assetCtxs[opIndex];

      console.log('\n========== OP 市场数据 ==========');
      console.log(`当前中间价: $${opPrice.toFixed(4)}`);
      console.log(`标记价格: $${opCtx?.markPx || 'N/A'}`);
      console.log(`Oracle 价格: $${opCtx?.oraclePx || 'N/A'}`);
      console.log(`24h 成交额: $${opCtx?.dayNtlVlm || 'N/A'}`);
      console.log(`资金费率: ${opCtx?.funding || 'N/A'}`);
      console.log(`未平仓量: ${opCtx?.openInterest || 'N/A'}`);
    });
  });

  describe('2. 查询账户状态', () => {
    it('should display account balance before trading', async () => {
      if (!canRun) return;

      const state = await infoApi.clearinghouseState(userAddress);

      console.log('\n========== 交易前账户状态 ==========');
      console.log(`用户地址: ${userAddress}`);
      console.log(`账户价值: ${state.marginSummary.accountValue} USDC`);
      console.log(`可提取余额: ${state.withdrawable} USDC`);
      console.log(`已用保证金: ${state.marginSummary.totalMarginUsed} USDC`);
      console.log(`总持仓价值: ${state.marginSummary.totalNtlPos} USDC`);

      // 检查是否有 OP 持仓
      const opPosition = state.assetPositions.find(
        (p) => p.position.coin === 'OP'
      );
      if (opPosition) {
        console.log('\n--- 现有 OP 持仓 ---');
        console.log(`持仓数量: ${opPosition.position.szi}`);
        console.log(`入场价格: ${opPosition.position.entryPx}`);
        console.log(`未实现盈亏: ${opPosition.position.unrealizedPnl}`);
        console.log(`杠杆: ${opPosition.position.leverage.value}x (${opPosition.position.leverage.type})`);
      } else {
        console.log('\n当前无 OP 持仓');
      }

      expect(state.marginSummary).toBeDefined();
    });
  });

  describe('3. 设置杠杆', () => {
    it('should set leverage and display config', async () => {
      if (!canRun || opIndex < 0) return;

      const leverage = 5;
      const isCross = true;

      console.log('\n========== 设置杠杆 ==========');
      console.log(`目标杠杆: ${leverage}x`);
      console.log(`模式: ${isCross ? '全仓 (Cross)' : '逐仓 (Isolated)'}`);

      const response = await exchangeApi.updateLeverage(opIndex, leverage, isCross);

      expect(response.status).toBe('ok');
      console.log(`设置结果: ${response.status}`);
      console.log(`杠杆已设置为 ${leverage}x 全仓模式`);
    });
  });

  describe('4. 下单', () => {
    it('should place order and display order status', async () => {
      if (!canRun || opIndex < 0 || opPrice <= 0) return;

      // 设置远低于市价的买单 (50% 市价)，避免成交
      const limitPrice = Math.floor(opPrice * 0.5 * 1000) / 1000; // 保留3位小数
      const size = 1; // 1 OP
      const isBuy = true;

      console.log('\n========== 下单 ==========');
      console.log(`交易对: OP-USD`);
      console.log(`方向: ${isBuy ? '买入/做多 (Long)' : '卖出/做空 (Short)'}`);
      console.log(`订单类型: 限价单 (Limit GTC)`);
      console.log(`价格: $${limitPrice} (市价的 50%，不会成交)`);
      console.log(`数量: ${size} OP`);
      console.log(`订单价值: $${(limitPrice * size).toFixed(2)}`);

      const response = await exchangeApi.placeOrder([
        {
          asset: opIndex,
          isBuy,
          price: limitPrice,
          size,
          tif: 'Gtc',
        },
      ]);

      expect(response.status).toBe('ok');
      console.log(`\n下单结果: ${response.status}`);

      const status = response.response.data.statuses[0];
      if (status.status === 'resting' && status.resting) {
        placedOrderId = status.resting.oid;
        console.log(`订单状态: 挂单中 (Resting)`);
        console.log(`订单 ID: ${placedOrderId}`);
      } else if (status.status === 'filled' && status.filled) {
        console.log(`订单状态: 已成交 (Filled)`);
        console.log(`成交价格: ${status.filled.avgPx}`);
        console.log(`成交数量: ${status.filled.totalSz}`);
      } else {
        console.log(`订单状态: ${JSON.stringify(status)}`);
      }
    });
  });

  describe('5. 查看挂单', () => {
    it('should display open orders', async () => {
      if (!canRun) return;

      const openOrders = await infoApi.frontendOpenOrders(userAddress);
      const opOrders = openOrders.filter((o) => o.coin === 'OP');

      console.log('\n========== 当前 OP 挂单 ==========');
      console.log(`OP 挂单数量: ${opOrders.length}`);

      for (const order of opOrders) {
        console.log('\n--- 订单详情 ---');
        console.log(`订单 ID: ${order.oid}`);
        console.log(`方向: ${order.side === 'B' ? '买入' : '卖出'}`);
        console.log(`价格: $${order.limitPx}`);
        console.log(`数量: ${order.sz} / ${order.origSz} OP`);
        console.log(`订单类型: ${order.orderType}`);
        console.log(`有效期: ${order.tif}`);
        console.log(`时间: ${new Date(order.timestamp).toLocaleString()}`);
      }

      if (opOrders.length === 0) {
        console.log('当前无 OP 挂单');
      }
    });
  });

  describe('6. 查看仓位变化', () => {
    it('should display position after order', async () => {
      if (!canRun) return;

      const state = await infoApi.clearinghouseState(userAddress);
      const opPosition = state.assetPositions.find(
        (p) => p.position.coin === 'OP'
      );

      console.log('\n========== OP 仓位信息 ==========');

      if (opPosition) {
        const pos = opPosition.position;
        console.log(`持仓数量: ${pos.szi} OP`);
        console.log(`入场价格: $${pos.entryPx}`);
        console.log(`持仓价值: $${pos.positionValue}`);
        console.log(`杠杆: ${pos.leverage.value}x (${pos.leverage.type})`);
        console.log(`强平价格: ${pos.liquidationPx || 'N/A'}`);
        console.log(`未实现盈亏: ${pos.unrealizedPnl} USDC`);
        console.log(`收益率: ${(parseFloat(pos.returnOnEquity) * 100).toFixed(2)}%`);
        console.log(`已用保证金: ${pos.marginUsed} USDC`);

        // 累计资金费
        console.log('\n--- 累计资金费 ---');
        console.log(`总计: ${pos.cumFunding.allTime} USDC`);
        console.log(`开仓后: ${pos.cumFunding.sinceOpen} USDC`);
      } else {
        console.log('当前无 OP 持仓 (限价单未成交)');
      }
    });
  });

  describe('7. 查看账户余额变化', () => {
    it('should display account balance after trading', async () => {
      if (!canRun) return;

      const state = await infoApi.clearinghouseState(userAddress);

      console.log('\n========== 交易后账户状态 ==========');
      console.log(`账户价值: ${state.marginSummary.accountValue} USDC`);
      console.log(`可提取余额: ${state.withdrawable} USDC`);
      console.log(`已用保证金: ${state.marginSummary.totalMarginUsed} USDC`);
      console.log(`总持仓价值: ${state.marginSummary.totalNtlPos} USDC`);

      // 全仓保证金详情
      console.log('\n--- 全仓保证金 ---');
      console.log(`账户价值: ${state.crossMarginSummary.accountValue} USDC`);
      console.log(`已用保证金: ${state.crossMarginSummary.totalMarginUsed} USDC`);

      // 所有持仓汇总
      console.log('\n--- 所有持仓汇总 ---');
      if (state.assetPositions.length > 0) {
        for (const ap of state.assetPositions) {
          const pos = ap.position;
          console.log(`${pos.coin}: ${pos.szi} @ $${pos.entryPx}, PnL: ${pos.unrealizedPnl}`);
        }
      } else {
        console.log('无持仓');
      }
    });
  });

  describe('8. 撤单', () => {
    it('should cancel order and display result', async () => {
      if (!canRun || placedOrderId === null || opIndex < 0) {
        console.log('\n========== 撤单 ==========');
        console.log('无需撤单 (没有挂单或订单已成交)');
        return;
      }

      console.log('\n========== 撤单 ==========');
      console.log(`撤销订单 ID: ${placedOrderId}`);

      const response = await exchangeApi.cancelOrder([
        { asset: opIndex, oid: placedOrderId },
      ]);

      expect(response.status).toBe('ok');
      console.log(`撤单结果: ${response.status}`);

      // 验证订单已撤销
      const openOrders = await infoApi.frontendOpenOrders(userAddress);
      const canceledOrder = openOrders.find((o) => o.oid === placedOrderId);

      if (!canceledOrder) {
        console.log('订单已成功撤销');
        placedOrderId = null; // 清除，避免 afterAll 重复撤单
      } else {
        console.log('警告: 订单可能未完全撤销');
      }
    });
  });

  describe('9. 最终账户状态', () => {
    it('should display final account state', async () => {
      if (!canRun) return;

      const state = await infoApi.clearinghouseState(userAddress);

      console.log('\n========== 最终账户状态 ==========');
      console.log(`账户价值: ${state.marginSummary.accountValue} USDC`);
      console.log(`可提取余额: ${state.withdrawable} USDC`);
      console.log(`已用保证金: ${state.marginSummary.totalMarginUsed} USDC`);
      console.log(`持仓数量: ${state.assetPositions.length}`);
      console.log('\n========== 测试完成 ==========');
    });
  });
});
