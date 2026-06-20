/**
 * FetchService 请求取消测试
 *
 * 演示如何使用请求取消功能
 * 可以在浏览器控制台或 Node.js 环境中运行
 */

import { fetchService, FetchCancelError } from './fetch';

// ============================================================================
// 测试用例
// ============================================================================

/**
 * 测试 1: 基础取消功能
 */
async function testBasicCancel() {
  console.log('\n=== 测试 1: 基础取消 ===');

  // 创建取消令牌
  const cancelToken = fetchService.createCancelToken();
  console.log('创建取消令牌:', cancelToken.requestId);

  // 发起请求
  const promise = fetchService
    .get('/admin/items', { signal: cancelToken, params: { page: 1 } })
    .then((data) => {
      console.log('✅ 请求成功:', data);
      return data;
    })
    .catch((error) => {
      if (error instanceof FetchCancelError) {
        console.log('✅ 请求被正确取消:', error.message);
        console.log('   Request ID:', error.requestId);
      } else {
        console.error('❌ 请求失败:', error);
      }
      throw error;
    });

  // 延迟 100ms 后取消请求
  setTimeout(() => {
    console.log('取消请求...');
    cancelToken.cancel('测试取消');
  }, 100);

  await promise;
}

/**
 * 测试 2: 取消所有请求
 */
async function testCancelAll() {
  console.log('\n=== 测试 2: 取消所有请求 ===');

  // 创建多个请求
  const cancelTokens = [
    fetchService.createCancelToken(),
    fetchService.createCancelToken(),
    fetchService.createCancelToken(),
  ];

  console.log('待处理请求数:', fetchService.getPendingRequestsCount());

  // 发起所有请求
  cancelTokens.forEach((token, index) => {
    fetchService
      .get(`/admin/items/${index}`, { signal: token })
      .then(() => console.log(`请求 ${index} 完成`))
      .catch((error) => {
        if (error instanceof FetchCancelError) {
          console.log(`✅ 请求 ${index} 被取消`);
        }
      });
  });

  // 取消所有请求
  console.log('取消所有请求...');
  fetchService.cancelAllRequests('测试取消所有');

  console.log('剩余待处理请求数:', fetchService.getPendingRequestsCount());

  // 等待所有请求完成
  await new Promise((resolve) => setTimeout(resolve, 100));
}

/**
 * 测试 3: 搜索防抖 + 取消
 */
async function testSearchWithCancel() {
  console.log('\n=== 测试 3: 搜索防抖 + 取消 ===');

  let currentCancelToken: ReturnType<typeof fetchService.createCancelToken> | null = null;

  const search = async (query: string) => {
    // 取消之前的请求
    if (currentCancelToken) {
      console.log(`取消之前的搜索: "${query}"`);
      currentCancelToken.cancel('新搜索开始');
    }

    // 创建新的取消令牌
    currentCancelToken = fetchService.createCancelToken();

    try {
      console.log(`搜索: "${query}"`);
      const results = await fetchService.get('/admin/items/search', {
        signal: currentCancelToken,
        params: { q: query },
      });
      console.log(`✅ 搜索结果:`, results);
      return results;
    } catch (error) {
      if (error instanceof FetchCancelError) {
        console.log(`⏭️  搜索被取消: "${query}"`);
        return null;
      }
      throw error;
    }
  };

  // 模拟快速连续搜索
  await search('苹果');
  await new Promise((resolve) => setTimeout(resolve, 50));

  await search('香蕉');
  await new Promise((resolve) => setTimeout(resolve, 50));

  await search('橙子');
  await new Promise((resolve) => setTimeout(resolve, 50));

  // 等待最后一个请求完成
  await new Promise((resolve) => setTimeout(resolve, 100));

  console.log('待处理请求数:', fetchService.getPendingRequestsCount());
}

/**
 * 测试 4: 组件卸载模拟
 */
async function testComponentUnmount() {
  console.log('\n=== 测试 4: 组件卸载模拟 ===');

  // 模拟组件挂载
  const cancelToken = fetchService.createCancelToken();
  console.log('组件挂载，发起请求:', cancelToken.requestId);

  // 模拟发起请求
  const requestPromise = fetchService
    .get('/admin/items', { signal: cancelToken })
    .then((data) => {
      console.log('✅ 请求成功（不应该看到这行）');
      return data;
    })
    .catch((error) => {
      if (error instanceof FetchCancelError) {
        console.log('✅ 组件卸载时请求被取消');
      } else {
        console.error('❌ 请求失败:', error);
      }
    });

  // 模拟组件卸载
  console.log('组件卸载，取消请求...');
  cancelToken.cancel('Component unmounted');

  await requestPromise;
}

/**
 * 测试 5: 请求状态检查
 */
async function testRequestStatus() {
  console.log('\n=== 测试 5: 请求状态检查 ===');

  // 创建多个令牌
  const token1 = fetchService.createCancelToken();
  const token2 = fetchService.createCancelToken();

  console.log('待处理请求数:', fetchService.getPendingRequestsCount()); // 0

  console.log(`Token1 是否待处理:`, fetchService.isRequestPending(token1.requestId)); // false
  console.log(`Token2 是否待处理:`, fetchService.isRequestPending(token2.requestId)); // false

  // 发起请求
  fetchService
    .get('/admin/items', { signal: token1 })
    .catch((error) => {
      if (error instanceof FetchCancelError) {
        // 忽略取消错误
      }
    });

  console.log('待处理请求数:', fetchService.getPendingRequestsCount()); // 1
  console.log(`Token1 是否待处理:`, fetchService.isRequestPending(token1.requestId)); // true

  // 清理
  token1.cancel('清理测试');
  await new Promise((resolve) => setTimeout(resolve, 50));

  console.log('待处理请求数:', fetchService.getPendingRequestsCount()); // 0
}

// ============================================================================
// 运行测试
// ============================================================================

async function runAllTests() {
  console.log('🚀 开始 FetchService 取消请求测试');

  try {
    await testBasicCancel();
    await testCancelAll();
    await testSearchWithCancel();
    await testComponentUnmount();
    await testRequestStatus();

    console.log('\n✅ 所有测试完成');
  } catch (error) {
    console.error('\n❌ 测试失败:', error);
  }
}

// 导出测试函数（如果在 Node.js 环境）
// if (typeof window === 'undefined') {
//   runAllTests();
// }

export {
  testBasicCancel,
  testCancelAll,
  testSearchWithCancel,
  testComponentUnmount,
  testRequestStatus,
  runAllTests,
};
