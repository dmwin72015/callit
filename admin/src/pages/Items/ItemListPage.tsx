import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  Card,
  Space,
  Button,
  Input,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { getItems } from '../../services/items';
import type { ItemResponse } from '../../types';

const { Title } = Typography;

export default function ItemListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['items', { page, page_size: pageSize, search }],
    queryFn: () =>
      getItems({
        page,
        page_size: pageSize,
        search: search || undefined,
      }),
  });

  const columns: ColumnsType<ItemResponse> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '分类ID',
      dataIndex: 'category_id',
      key: 'category_id',
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Button type="link" onClick={() => navigate(`/items/${record.id}`)}>
          编辑
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2} style={{ margin: 0 }}>物品管理</Title>
        <Space>
          <Input.Search
            placeholder="搜索物品名称"
            prefix={<SearchOutlined />}
            onSearch={(value) => {
              setSearch(value);
              setPage(1);
            }}
            style={{ width: 250 }}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/items/new')}>
            新增物品
          </Button>
        </Space>
      </div>

      <Card>
        <Table<ItemResponse>
          columns={columns}
          dataSource={data?.data || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize,
            total: data?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPage(page);
              setPageSize(pageSize);
            },
          }}
        />
      </Card>
    </div>
  );
}
