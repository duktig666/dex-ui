import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import {
  getExchangeAPI,
  getInfoAPI,
  canRunExchangeTests,
  getTestUserAddress,
} from '../setup';
import type { ExchangeAPI } from '../../src/api/exchange';
import type { InfoAPI } from '../../src/api/info';
import type { PerpAsset } from '../../src/types/info';
import { generateCloid } from '../../src/utils/helpers';

describe('Order API', () => {
  let exchangeApi: ExchangeAPI;
  let infoApi: InfoAPI;
  let canRun: boolean;
  let placedOrderIds: Array<{ asset: number; oid: number }> = [];

  // OP 相关信息
  let opAsset: PerpAsset | undefined;
  let opIndex: number = -1;
  let opPrice: number = 0;

  beforeAll(async () => {
    canRun = canRunExchangeTests();
    if (canRun) {
      exchangeApi = getExchangeAPI();
      infoApi = getInfoAPI();

      // 获取 OP 信息
      const meta = await infoApi.meta();
      opAsset = meta.universe.find((a) => a.name === 'OP');
      if (opAsset) {
        opIndex = meta.universe.indexOf(opAsset);
      }

      // 获取 OP 当前价格
      const mids = await infoApi.allMids();
      opPrice = parseFloat(mids['OP'] || '0');

      console.log('\n========== 订单测试初始化 ==========');
      console.log(`代币: OP`);
      console.log(`Asset Index: ${opIndex}`);
      console.log(`当前价格: $${opPrice.toFixed(4)}`);
      console.log(`数量精度: ${opAsset?.szDecimals} 位小数`);
    }
  });

  beforeEach(() => {
    if (!canRun) {
      console.log('跳过测试: 未设置 PRIVATE_KEY');
    }
    if (opIndex < 0) {
      console.log('跳过测试: 未找到 OP 代币');
    }
  });

  // 测试结束后清理订单
  afterAll(async () => {
    if (canRun && placedOrderIds.length > 0) {
      try {
        console.log('\n========== 清理挂单 ==========');
        console.log(`待撤销订单数: ${placedOrderIds.length}`);
        await exchangeApi.cancelOrder(placedOrderIds);
        console.log('所有订单已撤销');
      } catch (e) {
        console.log('撤单失败或订单已不存在');
      }
    }
  });

  describe('placeOrder - limit order (限价单)', () => {
    it('should place OP buy limit order far from market', async () => {
      if (!canRun || opIndex < 0 || opPrice <= 0) return;

      // 设置一个远低于市价的买单价格 (50% 低于当前价)
      const limitPrice = Math.floor(opPrice * 0.5 * 1000) / 1000;
      const size = 1;

      console.log('\n--- 下买单 (远低于市价) ---');
      console.log(`价格: $${limitPrice} (市价 50%)`);
      console.log(`数量: ${size} OP`);

      const response = await exchangeApi.placeOrder([
        {
          asset: opIndex,
          isBuy: true,
          price: limitPrice,
          size,
          tif: 'Gtc',
        },
      ]);

      expect(response).toBeDefined();
      expect(response.status).toBe('ok');
      expect(response.response.type).toBe('order');
      expect(response.response.data.statuses).toBeDefined();

      const status = response.response.data.statuses[0];
      console.log(`结果: ${response.status}`);

      if (status.status === 'resting' && status.resting) {
        placedOrderIds.push({ asset: opIndex, oid: status.resting.oid });
        console.log(`订单状态: 挂单中`);
        console.log(`订单 ID: ${status.resting.oid}`);
      }
    });

    it('should place OP sell limit order far from market', async () => {
      if (!canRun || opIndex < 0 || opPrice <= 0) return;

      // 设置一个远高于市价的卖单价格 (200% 高于当前价)
      const limitPrice = Math.floor(opPrice * 2 * 1000) / 1000;
      const size = 1;

      console.log('\n--- 下卖单 (远高于市价) ---');
      console.log(`价格: $${limitPrice} (市价 200%)`);
      console.log(`数量: ${size} OP`);

      const response = await exchangeApi.placeOrder([
        {
          asset: opIndex,
          isBuy: false,
          price: limitPrice,
          size,
          tif: 'Gtc',
        },
      ]);

      expect(response).toBeDefined();
      expect(response.status).toBe('ok');

      const status = response.response.data.statuses[0];
      console.log(`结果: ${response.status}`);

      if (status.status === 'resting' && status.resting) {
        placedOrderIds.push({ asset: opIndex, oid: status.resting.oid });
        console.log(`订单状态: 挂单中`);
        console.log(`订单 ID: ${status.resting.oid}`);
      }
    });

    it('should place order with client order id (cloid)', async () => {
      if (!canRun || opIndex < 0 || opPrice <= 0) return;

      const limitPrice = Math.floor(opPrice * 0.5 * 1000) / 1000;
      const size = 1;
      const cloid = generateCloid();

      console.log('\n--- 使用自定义订单 ID 下单 ---');
      console.log(`价格: $${limitPrice}`);
      console.log(`数量: ${size} OP`);
      console.log(`Client Order ID: ${cloid}`);

      const response = await exchangeApi.placeOrder([
        {
          asset: opIndex,
          isBuy: true,
          price: limitPrice,
          size,
          tif: 'Gtc',
          cloid,
        },
      ]);

      expect(response).toBeDefined();
      expect(response.status).toBe('ok');

      const status = response.response.data.statuses[0];
      console.log(`结果: ${response.status}`);

      if (status.status === 'resting' && status.resting) {
        placedOrderIds.push({ asset: opIndex, oid: status.resting.oid });
        console.log(`订单 ID: ${status.resting.oid}`);
      }
    });

    it('should place multiple OP orders at once', async () => {
      if (!canRun || opIndex < 0 || opPrice <= 0) return;

      const price1 = Math.floor(opPrice * 0.4 * 1000) / 1000;
      const price2 = Math.floor(opPrice * 0.3 * 1000) / 1000;
      const size = 1;

      console.log('\n--- 批量下单 ---');
      console.log(`订单1: 买入 ${size} OP @ $${price1}`);
      console.log(`订单2: 买入 ${size} OP @ $${price2}`);

      const response = await exchangeApi.placeOrder([
        { asset: opIndex, isBuy: true, price: price1, size, tif: 'Gtc' },
        { asset: opIndex, isBuy: true, price: price2, size, tif: 'Gtc' },
      ]);

      expect(response).toBeDefined();
      expect(response.status).toBe('ok');

      console.log(`结果: ${response.status}`);

      for (const status of response.response.data.statuses) {
        if (status.status === 'resting' && status.resting) {
          placedOrderIds.push({ asset: opIndex, oid: status.resting.oid });
          console.log(`订单 ID: ${status.resting.oid}`);
        }
      }
    });
  });

  describe('placeOrder - IOC order', () => {
    it('should place IOC order that gets canceled if not filled', async () => {
      if (!canRun || opIndex < 0 || opPrice <= 0) return;

      // IOC 订单设置远离市价，不会成交
      const limitPrice = Math.floor(opPrice * 0.1 * 1000) / 1000;
      const size = 1;

      console.log('\n--- IOC 订单 (立即成交或取消) ---');
      console.log(`价格: $${limitPrice} (市价 10%，不会成交)`);
      console.log(`数量: ${size} OP`);

      const response = await exchangeApi.placeOrder([
        {
          asset: opIndex,
          isBuy: true,
          price: limitPrice,
          size,
          tif: 'Ioc',
        },
      ]);

      expect(response).toBeDefined();
      expect(response.status).toBe('ok');

      console.log(`结果: ${response.status}`);
      console.log('IOC 订单如果不能成交会被立即取消');
    });
  });

  describe('cancelOrder (撤单)', () => {
    it('should cancel placed order', async () => {
      if (!canRun || opIndex < 0) return;
      if (placedOrderIds.length === 0) {
        console.log('跳过: 没有可撤销的订单');
        return;
      }

      const orderToCancel = placedOrderIds[0];
      console.log('\n--- 撤销单个订单 ---');
      console.log(`订单 ID: ${orderToCancel.oid}`);

      const response = await exchangeApi.cancelOrder([orderToCancel]);

      expect(response).toBeDefined();
      expect(response.status).toBe('ok');
      expect(response.response.type).toBe('cancel');

      console.log(`结果: ${response.status}`);

      // 从列表中移除已撤销的订单
      placedOrderIds = placedOrderIds.filter(
        (o) => !(o.asset === orderToCancel.asset && o.oid === orderToCancel.oid)
      );
      console.log(`剩余挂单数: ${placedOrderIds.length}`);
    });

    it('should cancel multiple orders at once', async () => {
      if (!canRun || opIndex < 0 || opPrice <= 0) return;

      // 先下两个订单
      const price1 = Math.floor(opPrice * 0.35 * 1000) / 1000;
      const price2 = Math.floor(opPrice * 0.25 * 1000) / 1000;

      console.log('\n--- 批量撤单测试 ---');
      console.log('先下两个订单...');

      const response1 = await exchangeApi.placeOrder([
        { asset: opIndex, isBuy: true, price: price1, size: 1 },
        { asset: opIndex, isBuy: true, price: price2, size: 1 },
      ]);

      const newOrders: Array<{ asset: number; oid: number }> = [];
      for (const status of response1.response.data.statuses) {
        if (status.status === 'resting' && status.resting) {
          newOrders.push({ asset: opIndex, oid: status.resting.oid });
          console.log(`下单成功, ID: ${status.resting.oid}`);
        }
      }

      if (newOrders.length >= 2) {
        console.log(`批量撤销 ${newOrders.length} 个订单...`);
        const cancelResponse = await exchangeApi.cancelOrder(newOrders);

        expect(cancelResponse).toBeDefined();
        expect(cancelResponse.status).toBe('ok');

        console.log(`撤单结果: ${cancelResponse.status}`);
      }
    });
  });

  describe('modifyOrder (改单)', () => {
    it('should modify order price', async () => {
      if (!canRun || opIndex < 0 || opPrice <= 0) return;

      // 先下一个订单
      const originalPrice = Math.floor(opPrice * 0.5 * 1000) / 1000;
      const size = 1;

      console.log('\n--- 修改订单价格 ---');
      console.log(`原价格: $${originalPrice}`);

      const placeResponse = await exchangeApi.placeOrder([
        { asset: opIndex, isBuy: true, price: originalPrice, size },
      ]);

      const status = placeResponse.response.data.statuses[0];
      if (status.status !== 'resting' || !status.resting) {
        console.log('下单失败，跳过改单测试');
        return;
      }

      const oid = status.resting.oid;
      console.log(`订单 ID: ${oid}`);

      // 修改订单价格
      const newPrice = Math.floor(opPrice * 0.4 * 1000) / 1000;
      console.log(`新价格: $${newPrice}`);

      const modifyResponse = await exchangeApi.modifyOrder(oid, {
        asset: opIndex,
        isBuy: true,
        price: newPrice,
        size,
      });

      expect(modifyResponse).toBeDefined();
      expect(modifyResponse.status).toBe('ok');

      console.log(`改单结果: ${modifyResponse.status}`);

      // 清理
      try {
        await exchangeApi.cancelOrder([{ asset: opIndex, oid }]);
        console.log('订单已清理');
      } catch (e) {
        // 忽略
      }
    });

    it('should modify order size', async () => {
      if (!canRun || opIndex < 0 || opPrice <= 0) return;

      const price = Math.floor(opPrice * 0.5 * 1000) / 1000;
      const originalSize = 1;
      const newSize = 2;

      console.log('\n--- 修改订单数量 ---');
      console.log(`价格: $${price}`);
      console.log(`原数量: ${originalSize} OP`);

      const placeResponse = await exchangeApi.placeOrder([
        { asset: opIndex, isBuy: true, price, size: originalSize },
      ]);

      const status = placeResponse.response.data.statuses[0];
      if (status.status !== 'resting' || !status.resting) {
        console.log('下单失败，跳过改单测试');
        return;
      }

      const oid = status.resting.oid;
      console.log(`订单 ID: ${oid}`);
      console.log(`新数量: ${newSize} OP`);

      const modifyResponse = await exchangeApi.modifyOrder(oid, {
        asset: opIndex,
        isBuy: true,
        price,
        size: newSize,
      });

      expect(modifyResponse).toBeDefined();
      expect(modifyResponse.status).toBe('ok');

      console.log(`改单结果: ${modifyResponse.status}`);

      // 清理
      try {
        await exchangeApi.cancelOrder([{ asset: opIndex, oid }]);
        console.log('订单已清理');
      } catch (e) {
        // 忽略
      }
    });
  });

  describe('verify orders (验证订单)', () => {
    it('should show placed orders in open orders', async () => {
      if (!canRun || opIndex < 0 || opPrice <= 0) return;

      // 下一个订单
      const price = Math.floor(opPrice * 0.45 * 1000) / 1000;
      const size = 1;

      console.log('\n--- 验证订单在挂单列表中 ---');

      const placeResponse = await exchangeApi.placeOrder([
        { asset: opIndex, isBuy: true, price, size },
      ]);

      const status = placeResponse.response.data.statuses[0];
      if (status.status !== 'resting' || !status.resting) {
        console.log('下单失败');
        return;
      }

      const oid = status.resting.oid;
      console.log(`下单成功, ID: ${oid}`);

      // 查询挂单
      const userAddress = getTestUserAddress();
      const openOrders = await infoApi.openOrders(userAddress);

      const foundOrder = openOrders.find((o) => o.oid === oid);
      expect(foundOrder).toBeDefined();

      if (foundOrder) {
        console.log('\n挂单信息:');
        console.log(`  订单 ID: ${foundOrder.oid}`);
        console.log(`  方向: ${foundOrder.side === 'B' ? '买入' : '卖出'}`);
        console.log(`  价格: $${foundOrder.limitPx}`);
        console.log(`  数量: ${foundOrder.sz} / ${foundOrder.origSz}`);
      }

      // 清理
      await exchangeApi.cancelOrder([{ asset: opIndex, oid }]);
      console.log('订单已撤销');
    });
  });
});
