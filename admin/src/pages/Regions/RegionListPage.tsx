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
import { getRegions, createRegion, updateRegion, deleteRegion } from '../../services/regions';
import type { RegionResponse } from '../../types';

const { Title } = Typography;

export default function RegionListPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [editingRegion, setEditingRegion] = useState<RegionResponse | null>(null);
  const [creatingRegion, setCreatingRegion] = useState(false);
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['regions', { page, page_size: pageSize, search }],
    queryFn: () =>
      getRegions({
        page,
        page_size: pageSize,
        search: search || undefined,
      }),
  });

  const createMutation = useMutation({
    mutationFn: createRegion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      message.success('创建成功');
      setCreatingRegion(false);
      form.resetFields();
    },
    onError: () => message.error('创建失败'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<RegionResponse> }) =>
      updateRegion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
      message.success('更新成功');
      setEditingRegion(null);
      form.resetFields();
    },
    onError: () => message.error('更新失败'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRegion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
      message.success('删除成功');
    },
    onError: () => message.error('删除失败'),
  });

  const columns: ColumnsType<RegionResponse> = [
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
      title: '代码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
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
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingRegion(record);
              form.setFieldsValue(record);
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除此地区？"
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
        <Title level={2} style={{ margin: 0 }}>地区管理</Title>
        <Space>
          <Input.Search
            placeholder="搜索地区名称/代码"
            onSearch={(value) => {
              setSearch(value);
              setPage(1);
            }}
            style={{ width: 250 }}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreatingRegion(true)}>
            新增地区
          </Button>
        </Space>
      </div>

      <Card>
        <Table<RegionResponse>
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
        title="新增地区"
        open={creatingRegion}
        onCancel={() => {
          setCreatingRegion(false);
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
            label="地区名称"
            rules={[{ required: true, message: '请输入地区名称' }]}
          >
            <Input placeholder="请输入地区名称" />
          </Form.Item>

          <Form.Item
            name="code"
            label="代码"
            rules={[{ required: true, message: '请输入地区代码' }]}
          >
            <Input placeholder="请输入地区代码" />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入地区描述" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
                创建
              </Button>
              <Button onClick={() => setCreatingRegion(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="编辑地区"
        open={!!editingRegion}
        onCancel={() => {
          setEditingRegion(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            if (editingRegion) {
              updateMutation.mutate({ id: editingRegion.id, data: values });
            }
          }}
        >
          <Form.Item
            name="name"
            label="地区名称"
            rules={[{ required: true, message: '请输入地区名称' }]}
          >
            <Input placeholder="请输入地区名称" />
          </Form.Item>

          <Form.Item
            name="code"
            label="代码"
            rules={[{ required: true, message: '请输入地区代码' }]}
          >
            <Input placeholder="请输入地区代码" />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入地区描述" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
                保存
              </Button>
              <Button onClick={() => setEditingRegion(null)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
