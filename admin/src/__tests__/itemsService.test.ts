/**
 * Items Service 测试示例
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as itemsService from '../services/items';
import { fetchService } from '../lib/http/fetch';

// Mock fetchService
vi.mock('../lib/http/fetch', () => ({
  fetchService: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('ItemsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getItems', () => {
    it('应该获取条目列表', async () => {
      const mockResponse = {
        data: [
          { id: 1, name: 'Item 1', category_id: 1, category_name: 'Category 1', aliases_count: 5, created_at: '2024-01-01T00:00:00Z' },
          { id: 2, name: 'Item 2', category_id: 2, category_name: 'Category 2', aliases_count: 3, created_at: '2024-01-02T00:00:00Z' },
        ],
        page: 1,
        page_size: 20,
        total: 2,
      };

      (fetchService.get as any).mockResolvedValue(mockResponse);

      const result = await itemsService.getItems({ page: 1, page_size: 20 });

      expect(fetchService.get).toHaveBeenCalledWith('/admin/items', {
        params: { page: 1, page_size: 20 },
      });
      expect(result).toEqual(mockResponse);
    });

    it('应该支持搜索参数', async () => {
      (fetchService.get as any).mockResolvedValue({ data: [], page: 1, page_size: 20, total: 0 });

      await itemsService.getItems({ search: 'test' });

      expect(fetchService.get).toHaveBeenCalledWith('/admin/items', {
        params: { search: 'test' },
      });
    });

    it('应该支持分类过滤', async () => {
      (fetchService.get as any).mockResolvedValue({ data: [], page: 1, page_size: 20, total: 0 });

      await itemsService.getItems({ category_id: 1 });

      expect(fetchService.get).toHaveBeenCalledWith('/admin/items', {
        params: { category_id: 1 },
      });
    });
  });

  describe('getItem', () => {
    it('应该根据 ID 获取条目', async () => {
      const mockItem = {
        id: 1,
        name: 'Item 1',
        description: 'Description',
        category_id: 1,
        category_name: 'Category',
        aliases_count: 5,
        created_at: '2024-01-01T00:00:00Z',
      };

      (fetchService.get as any).mockResolvedValue(mockItem);

      const result = await itemsService.getItem(1);

      expect(fetchService.get).toHaveBeenCalledWith('/admin/items/1');
      expect(result).toEqual(mockItem);
    });
  });

  describe('createItem', () => {
    it('应该创建新条目', async () => {
      const newItem = {
        name: 'New Item',
        description: 'Description',
        category_id: 1,
      };

      const mockResponse = {
        id: 3,
        name: 'New Item',
        description: 'Description',
        category_id: 1,
        category_name: 'Category',
        aliases_count: 0,
        created_at: '2024-01-03T00:00:00Z',
      };

      (fetchService.post as any).mockResolvedValue(mockResponse);

      const result = await itemsService.createItem(newItem);

      expect(fetchService.post).toHaveBeenCalledWith('/admin/items', newItem);
      expect(result).toEqual(mockResponse);
    });

    it('应该支持可选字段', async () => {
      const newItem = {
        name: 'New Item',
        category_id: 1,
        // description 是可选的
      };

      (fetchService.post as any).mockResolvedValue({
        id: 3,
        name: 'New Item',
        category_id: 1,
        category_name: 'Category',
        aliases_count: 0,
        created_at: '2024-01-03T00:00:00Z',
      });

      await itemsService.createItem(newItem);

      expect(fetchService.post).toHaveBeenCalledWith('/admin/items', newItem);
    });
  });

  describe('updateItem', () => {
    it('应该更新条目', async () => {
      const updateData = {
        name: 'Updated Name',
        description: 'Updated Description',
      };

      const mockResponse = {
        id: 1,
        name: 'Updated Name',
        description: 'Updated Description',
        category_id: 1,
        category_name: 'Category',
        aliases_count: 5,
        created_at: '2024-01-01T00:00:00Z',
      };

      (fetchService.put as any).mockResolvedValue(mockResponse);

      const result = await itemsService.updateItem(1, updateData);

      expect(fetchService.put).toHaveBeenCalledWith('/admin/items/1', updateData);
      expect(result).toEqual(mockResponse);
    });

    it('应该支持部分更新', async () => {
      const updateData = { name: 'Only Name Updated' };

      (fetchService.put as any).mockResolvedValue({
        id: 1,
        ...updateData,
      });

      await itemsService.updateItem(1, updateData);

      expect(fetchService.put).toHaveBeenCalledWith('/admin/items/1', updateData);
    });
  });

  describe('deleteItem', () => {
    it('应该删除条目', async () => {
      (fetchService.delete as any).mockResolvedValue(undefined);

      await itemsService.deleteItem(1);

      expect(fetchService.delete).toHaveBeenCalledWith('/admin/items/1');
    });
  });
});
