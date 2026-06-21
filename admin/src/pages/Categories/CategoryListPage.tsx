import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Card,
  Space,
  Button,
  Typography,
  Input,
  Popconfirm,
  App,
  Form,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/categories';
import CategoryFormModal from './components/CategoryFormModal';
import type { CategoryResponse } from '../../types';

const { Title } = Typography;

export default function CategoryListPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['categories', { page, pageSize, search }],
    queryFn: () =>
      getCategories({
        page,
        pageSize,
        search: search || undefined,
      }),
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setCreatingCategory(false);
      form.resetFields();
    },
    onError: () => message.error('创建失败'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CategoryResponse> }) =>
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditingCategory(null);
      form.resetFields();
    },
    onError: () => message.error('更新失败'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: () => message.error('删除失败'),
  });

  const columns: ColumnsType<CategoryResponse> = [
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
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingCategory(record);
              form.setFieldsValue(record);
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除此分类？"
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2} style={{ margin: 0 }}>分类管理</Title>
        <Space>
          <Input.Search
            placeholder="搜索分类名称"
            onSearch={(value) => {
              setSearch(value);
              setPage(1);
            }}
            style={{ width: 250 }}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreatingCategory(true)}>
            新增分类
          </Button>
        </Space>
      </div>

      <Card>
        <Table<CategoryResponse>
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

      <CategoryFormModal
        open={creatingCategory}
        form={form}
        submitting={createMutation.isPending}
        onSubmit={(values) => createMutation.mutate(values)}
        onCancel={() => {
          setCreatingCategory(false);
          form.resetFields();
        }}
      />

      <CategoryFormModal
        open={!!editingCategory}
        form={form}
        submitting={updateMutation.isPending}
        isEdit
        onSubmit={(values) => {
          if (editingCategory) {
            updateMutation.mutate({ id: editingCategory.id, data: values });
          }
        }}
        onCancel={() => {
          setEditingCategory(null);
          form.resetFields();
        }}
      />
    </div>
  );
}
