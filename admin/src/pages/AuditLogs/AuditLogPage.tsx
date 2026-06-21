import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  Card,
  Space,
  Select,
  Input,
  Typography,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { UserOutlined } from '@ant-design/icons';
import { getAuditLogs } from '../../services/auditLogs';
import type { AuditLogResponse } from '../../types';

const { Title } = Typography;

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [actionFilter, setActionFilter] = useState<string>();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', { page, pageSize, action: actionFilter, search }],
    queryFn: () =>
      getAuditLogs({
        page,
        pageSize,
        action: actionFilter,
      }),
  });

  const columns: ColumnsType<AuditLogResponse> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '操作类型',
      dataIndex: 'action',
      key: 'action',
      width: 150,
      render: (action: string) => {
        const colors: Record<string, string> = {
          USER_CREATE: 'green',
          USER_UPDATE: 'blue',
          USER_DELETE: 'red',
          ALIAS_SUBMIT: 'orange',
          ALIAS_APPROVE: 'green',
          ALIAS_REJECT: 'red',
          ITEM_CREATE: 'cyan',
          ITEM_UPDATE: 'blue',
          ITEM_DELETE: 'red',
          CATEGORY_CREATE: 'purple',
          CATEGORY_UPDATE: 'blue',
          REGION_CREATE: 'purple',
          TAG_CREATE: 'purple',
          LOGIN: 'geekblue',
          LOGOUT: 'default',
        };
        return <Tag color={colors[action] || 'default'}>{action}</Tag>;
      },
    },
    {
      title: '用户',
      dataIndex: 'username',
      key: 'username',
      width: 150,
      render: (username: string) => (
        <Space>
          <UserOutlined />
          {username || '系统'}
        </Space>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'IP地址',
      dataIndex: 'ip_address',
      key: 'ip_address',
      width: 150,
    },
    {
      title: '操作时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
    },
  ];

  const actionOptions = [
    { value: 'USER_CREATE', label: '创建用户' },
    { value: 'USER_UPDATE', label: '更新用户' },
    { value: 'USER_DELETE', label: '删除用户' },
    { value: 'ALIAS_SUBMIT', label: '提交别名' },
    { value: 'ALIAS_APPROVE', label: '通过别名' },
    { value: 'ALIAS_REJECT', label: '拒绝别名' },
    { value: 'ITEM_CREATE', label: '创建物品' },
    { value: 'ITEM_UPDATE', label: '更新物品' },
    { value: 'ITEM_DELETE', label: '删除物品' },
    { value: 'LOGIN', label: '登录' },
    { value: 'LOGOUT', label: '登出' },
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>审计日志</Title>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <Space>
            <Select
              placeholder="操作类型"
              allowClear
              style={{ width: 150 }}
              onChange={(value) => {
                setActionFilter(value);
                setPage(1);
              }}
              options={actionOptions}
            />
            <Input.Search
              placeholder="搜索描述"
              onSearch={(value) => {
                setSearch(value);
                setPage(1);
              }}
              style={{ width: 250 }}
              allowClear
            />
          </Space>
        </div>

        <Table<AuditLogResponse>
          columns={columns}
          dataSource={data?.items || []}
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
