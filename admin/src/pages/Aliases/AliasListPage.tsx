import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Card,
  Space,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  Typography,
  App,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  getAdminAliases,
  createAdminAlias,
  updateAdminAlias,
  deleteAdminAlias,
} from '../../services/aliases';
import { getItems } from '../../services/items';
import { searchRegions } from '../../services/regions';
import { useAuthStore } from '../../stores/authStore';
import type { AliasResponse, ItemResponse, RegionResponse } from '../../types';

const { Title } = Typography;
const { TextArea } = Input;

const NAME_TYPE_OPTIONS = [
  { label: '通用名 (COMMON)', value: 'COMMON' },
  { label: '别名 (ALIAS)', value: 'ALIAS' },
];

const STATUS_OPTIONS = [
  { label: '待审核', value: 'PENDING' },
  { label: '已通过', value: 'APPROVED' },
  { label: '已拒绝', value: 'REJECTED' },
];

export default function AliasListPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string>();
  const [editingAlias, setEditingAlias] = useState<AliasResponse | null>(null);
  const [creatingAlias, setCreatingAlias] = useState(false);
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-aliases', { page, pageSize, status: statusFilter }],
    queryFn: () =>
      getAdminAliases({
        page,
        pageSize,
        status: statusFilter,
      }),
  });

  const createMutation = useMutation({
    mutationFn: createAdminAlias,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-aliases'] });
      queryClient.invalidateQueries({ queryKey: ['aliases'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      message.success('创建成功');
      setCreatingAlias(false);
      form.resetFields();
    },
    onError: () => message.error('创建失败'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateAdminAlias>[1] }) =>
      updateAdminAlias(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-aliases'] });
      queryClient.invalidateQueries({ queryKey: ['aliases'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      message.success('更新成功');
      setEditingAlias(null);
      form.resetFields();
    },
    onError: () => message.error('更新失败'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminAlias,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-aliases'] });
      queryClient.invalidateQueries({ queryKey: ['aliases'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      message.success('删除成功');
    },
    onError: () => message.error('删除失败'),
  });

  const columns: ColumnsType<AliasResponse> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: '别名',
      dataIndex: 'aliasName',
      key: 'aliasName',
    },
    {
      title: '物品',
      dataIndex: 'item_name',
      key: 'item_name',
    },
    {
      title: '地区',
      dataIndex: 'region_name',
      key: 'region_name',
    },
    {
      title: '地区编码',
      dataIndex: 'regionCode',
      key: 'regionCode',
      width: 120,
    },
    {
      title: '类型',
      dataIndex: 'nameType',
      key: 'nameType',
      width: 100,
      render: (type: string) => (
        <span>{type === 'COMMON' ? '通用名' : type === 'ALIAS' ? '别名' : type}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const colors = { PENDING: 'orange', APPROVED: 'green', REJECTED: 'red' };
        const labels = { PENDING: '待审核', APPROVED: '已通过', REJECTED: '已拒绝' };
        return <span style={{ color: colors[status as keyof typeof colors] }}>{labels[status as keyof typeof labels]}</span>;
      },
    },
    {
      title: '投票数',
      dataIndex: 'votesCount',
      key: 'votesCount',
      width: 90,
    },
    {
      title: '提交者',
      dataIndex: 'submittedBy',
      key: 'submittedBy',
      width: 90,
      render: (v: number | null) => (v ?? '-'),
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
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingAlias(record);
              form.setFieldsValue(record);
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除此别名？"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleCreate = () => {
    form.resetFields();
    setCreatingAlias(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2} style={{ margin: 0 }}>别名管理</Title>
        <Space>
          <Select
            placeholder="筛选状态"
            allowClear
            style={{ width: 140 }}
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
            options={STATUS_OPTIONS}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新增别名
          </Button>
        </Space>
      </div>

      <Card>
        <Table<AliasResponse>
          columns={columns}
          dataSource={data?.items || []}
          rowKey="id"
          loading={isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}
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
        title="新增别名"
        open={creatingAlias}
        onCancel={() => {
          setCreatingAlias(false);
          form.resetFields();
        }}
        footer={null}
      >
        <AliasForm
          form={form}
          onSubmit={(values) => {
            const { reviewNote, ...data } = values as Record<string, unknown>;
            createMutation.mutate(data as any);
          }}
          submitting={createMutation.isPending}
          onCancel={() => {
            setCreatingAlias(false);
            form.resetFields();
          }}
        />
      </Modal>

      <Modal
        title="编辑别名"
        open={!!editingAlias}
        onCancel={() => {
          setEditingAlias(null);
          form.resetFields();
        }}
        footer={null}
      >
        {editingAlias && (
          <AliasForm
            form={form}
            onSubmit={(values) => {
              const { reviewNote, ...data } = values as Record<string, unknown>;
              updateMutation.mutate({ id: editingAlias.id, data: data as Parameters<typeof updateAdminAlias>[1] });
            }}
            submitting={updateMutation.isPending}
            onCancel={() => {
              setEditingAlias(null);
              form.resetFields();
            }}
            isEdit
          />
        )}
      </Modal>
    </div>
  );
}

function AliasForm({
  form,
  onSubmit,
  submitting,
  onCancel,
  isEdit = false,
}: {
  form: any;
  onSubmit: (values: Record<string, unknown>) => void;
  submitting: boolean;
  onCancel: () => void;
  isEdit?: boolean;
}) {
  const [itemSearch, setItemSearch] = useState('');
  const [regionSearch, setRegionSearch] = useState('');
  const currentUserId = useAuthStore.getState().user?.id;

  const { data: itemsData } = useQuery({
    queryKey: ['admin-items-search', itemSearch],
    queryFn: () => getItems({ page: 1, pageSize: 20, search: itemSearch || undefined }),
    enabled: !!itemSearch,
  });

  const { data: regionsData } = useQuery({
    queryKey: ['admin-regions-search', regionSearch],
    queryFn: () => searchRegions(regionSearch),
    enabled: !!regionSearch,
  });

  return (
    <Form form={form} layout="vertical" onFinish={onSubmit}>
      <Form.Item name="aliasName" label="别名" rules={[{ required: true, message: '请输入别名' }]}>
        <Input placeholder="请输入别名" />
      </Form.Item>

      <Space style={{ width: '100%' }}>
        <Form.Item
          name="itemId"
          label="物品"
          rules={[{ required: true, message: '请选择物品' }]}
          style={{ flex: 1 }}
        >
          <Select
            showSearch
            filterOption={false}
            placeholder="搜索并选择物品"
            options={itemsData?.items?.map((item: ItemResponse) => ({
              label: `[${item.id}] ${item.name}`,
              value: item.id,
            }))}
            onSearch={(val) => setItemSearch(val)}
            onChange={() => setItemSearch('')}
            notFoundContent={itemSearch ? '搜索中...' : '请输入关键词搜索'}
          />
        </Form.Item>
        <Form.Item
          name="regionCode"
          label="地区"
          rules={[{ required: true, message: '请选择地区' }]}
          style={{ flex: 1 }}
        >
          <Select
            showSearch
            filterOption={false}
            placeholder="搜索并选择地区"
            options={regionsData?.map((region: RegionResponse) => ({
              label: `[${region.code}] ${region.name}`,
              value: region.code,
            }))}
            onSearch={(val) => setRegionSearch(val)}
            onChange={() => setRegionSearch('')}
            notFoundContent={regionSearch ? '搜索中...' : '请输入关键词搜索'}
          />
        </Form.Item>
      </Space>

      <Space style={{ width: '100%' }}>
        <Form.Item name="nameType" label="名称类型" rules={[{ required: true, message: '请选择类型' }]} style={{ flex: 1 }}>
          <Select placeholder="请选择" options={NAME_TYPE_OPTIONS} />
        </Form.Item>
        {!isEdit && (
          <Form.Item name="status" label="状态" initialValue="PENDING" style={{ flex: 1 }}>
            <Select disabled options={NAME_TYPE_OPTIONS.map((opt) => ({ ...opt, label: opt.label + ' (自动)' }))} />
          </Form.Item>
        )}
      </Space>

      <Form.Item name="reviewNote" label="备注">
        <TextArea rows={2} placeholder="选填：添加备注信息" />
      </Form.Item>

      <Form.Item style={{ display: 'none' }} name="submittedBy" initialValue={currentUserId}>
        <Input />
      </Form.Item>

      <Form.Item style={{ display: 'none' }} name="votesCount" initialValue={0}>
        <Input />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={submitting}>
            提交
          </Button>
          <Button onClick={onCancel}>取消</Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
