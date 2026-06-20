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
  Popconfirm,
  Typography,
  App,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getTags, createTag, updateTag, deleteTag } from '../../services/tags';
import type { TagResponse } from '../../types';

const { Title } = Typography;

export default function TagListPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [editingTag, setEditingTag] = useState<TagResponse | null>(null);
  const [creatingTag, setCreatingTag] = useState(false);
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['tags', { page, page_size: pageSize, search }],
    queryFn: () =>
      getTags({
        page,
        page_size: pageSize,
        search: search || undefined,
      }),
  });

  const createMutation = useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      message.success('创建成功');
      setCreatingTag(false);
      form.resetFields();
    },
    onError: () => message.error('创建失败'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TagResponse> }) =>
      updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      message.success('更新成功');
      setEditingTag(null);
      form.resetFields();
    },
    onError: () => message.error('更新失败'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      message.success('删除成功');
    },
    onError: () => message.error('删除失败'),
  });

  const columns: ColumnsType<TagResponse> = [
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
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      width: 120,
      render: (color: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 20,
              height: 20,
              backgroundColor: color,
              borderRadius: 4,
              border: '1px solid #d9d9d9',
            }}
          />
          <span>{color}</span>
        </div>
      ),
    },
    {
      title: '别名数量',
      dataIndex: 'aliases_count',
      key: 'aliases_count',
      width: 120,
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
              setEditingTag(record);
              form.setFieldsValue({
                name: record.name,
                color: record.color,
              });
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除此标签？"
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
        <Title level={2} style={{ margin: 0 }}>标签管理</Title>
        <Space>
          <Input.Search
            placeholder="搜索标签名称"
            onSearch={(value) => {
              setSearch(value);
              setPage(1);
            }}
            style={{ width: 250 }}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreatingTag(true)}>
            新增标签
          </Button>
        </Space>
      </div>

      <Card>
        <Table<TagResponse>
          columns={columns}
          dataSource={data?.data || []}
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
        title="新增标签"
        open={creatingTag}
        onCancel={() => {
          setCreatingTag(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => createMutation.mutate(values)}
        >
          <Form.Item
            name="name"
            label="标签名称"
            rules={[{ required: true, message: '请输入标签名称' }]}
          >
            <Input placeholder="请输入标签名称" />
          </Form.Item>

          <Form.Item
            name="color"
            label="颜色"
            rules={[{ required: true, message: '请输入颜色值' }]}
          >
            <Input placeholder="例如: #1890ff" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
                创建
              </Button>
              <Button onClick={() => setCreatingTag(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="编辑标签"
        open={!!editingTag}
        onCancel={() => {
          setEditingTag(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            if (editingTag) {
              updateMutation.mutate({ id: editingTag.id, data: values });
            }
          }}
        >
          <Form.Item
            name="name"
            label="标签名称"
            rules={[{ required: true, message: '请输入标签名称' }]}
          >
            <Input placeholder="请输入标签名称" />
          </Form.Item>

          <Form.Item
            name="color"
            label="颜色"
            rules={[{ required: true, message: '请输入颜色值' }]}
          >
            <Input placeholder="例如: #1890ff" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
                保存
              </Button>
              <Button onClick={() => setEditingTag(null)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
