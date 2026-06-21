import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Card,
  Space,
  Tag,
  Switch,
  Button,
  Modal,
  Form,
  Select,
  Input,
  Popconfirm,
  Typography,
  App,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getUsers, updateUser, deleteUser } from '../../services/users';
import type { UserResponse } from '../../types';

const { Title } = Typography;

export default function UserListPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [roleFilter, setRoleFilter] = useState<string>();
  const [verifiedFilter, setVerifiedFilter] = useState<boolean | undefined>();
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['users', { page, pageSize, role: roleFilter, isVerified: verifiedFilter, search }],
    queryFn: () =>
      getUsers({
        page,
        pageSize,
        role: roleFilter,
        isVerified: verifiedFilter,
        search: search || undefined,
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UserResponse> }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('更新成功');
      setEditingUser(null);
      form.resetFields();
    },
    onError: () => message.error('更新失败'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('删除成功');
    },
    onError: () => message.error('删除失败'),
  });

  const columns: ColumnsType<UserResponse> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: string) => (
        <Tag color={role === 'ADMIN' ? 'red' : 'blue'}>{role}</Tag>
      ),
    },
    {
      title: '已验证',
      dataIndex: 'isVerified',
      key: 'isVerified',
      width: 120,
      render: (verified: boolean, record) => (
        <Switch
          checked={verified}
          onChange={(checked) =>
            updateMutation.mutate({
              id: record.id,
              data: { isVerified: checked },
            })
          }
          disabled={record.role === 'ADMIN'}
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => {
              setEditingUser(record);
              form.setFieldsValue(record);
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除此用户？"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2} style={{ margin: 0 }}>用户管理</Title>
        <Space>
          <Select
            placeholder="角色"
            allowClear
            style={{ width: 120 }}
            onChange={(value) => setRoleFilter(value)}
            options={[
              { value: 'ADMIN', label: '管理员' },
              { value: 'USER', label: '用户' },
            ]}
          />
          <Select
            placeholder="验证状态"
            allowClear
            style={{ width: 120 }}
            onChange={(value) => setVerifiedFilter(value)}
            options={[
              { value: true, label: '已验证' },
              { value: false, label: '未验证' },
            ]}
          />
          <Input.Search
            placeholder="搜索用户名/邮箱"
            onSearch={(value) => setSearch(value)}
            style={{ width: 200 }}
            allowClear
          />
        </Space>
      </div>

      <Card>
        <Table<UserResponse>
          columns={columns}
          dataSource={data?.items || []}
          rowKey="id"
          loading={isLoading || updateMutation.isPending || deleteMutation.isPending}
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

      <Modal
        title="编辑用户"
        open={!!editingUser}
        onCancel={() => {
          setEditingUser(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            if (editingUser) {
              updateMutation.mutate({ id: editingUser.id, data: values });
            }
          }}
        >
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'ADMIN', label: '管理员' },
                { value: 'USER', label: '用户' },
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
                保存
              </Button>
              <Button onClick={() => setEditingUser(null)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
