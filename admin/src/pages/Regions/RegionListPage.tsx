import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Card,
  Space,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Popconfirm,
  Typography,
  App,
  TreeSelect,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  getRegions,
  createRegion,
  updateRegion,
  deleteRegion,
  getRegionTree,
} from '../../services/regions';
import type { RegionResponse } from '../../types';

const { Title } = Typography;

const REGION_TYPE_OPTIONS = [
  { label: '省/直辖市', value: 'PROVINCE' },
  { label: '市', value: 'CITY' },
  { label: '区/县', value: 'DISTRICT' },
  { label: '街道/乡镇', value: 'STREET' },
  { label: '自定义', value: 'CUSTOM' },
];

function buildTreeSelectData(nodes: RegionResponse[]): { value: number; title: string; children?: any }[] {
  return nodes.map((node) => ({
    value: node.id,
    title: `[${node.region_type}] ${node.name} (${node.code})`,
    children: node.children && node.children.length > 0
      ? buildTreeSelectData(node.children)
      : undefined,
  }));
}

export default function RegionListPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [regionType, setRegionType] = useState<string>();
  const [parentID, setParentID] = useState<number | null>(null);
  const [editingRegion, setEditingRegion] = useState<RegionResponse | null>(null);
  const [creatingRegion, setCreatingRegion] = useState(false);
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['regions', { page, page_size: pageSize, region_type: regionType, parent_id: parentID }],
    queryFn: () =>
      getRegions({
        page,
        page_size: pageSize,
        region_type: regionType,
        parent_id: parentID ?? undefined,
      }),
  });

  const { data: treeData } = useQuery({
    queryKey: ['regionTree'],
    queryFn: () => getRegionTree(),
    staleTime: 5 * 60 * 1000,
  });

  const treeSelectData = useMemo(() => {
    if (!treeData) return [];
    return buildTreeSelectData(treeData);
  }, [treeData]);

  const createMutation = useMutation({
    mutationFn: (values: any) => createRegion({ ...values, parent_id: values.parent_id ?? undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
      queryClient.invalidateQueries({ queryKey: ['regionTree'] });
      message.success('创建成功');
      setCreatingRegion(false);
      form.resetFields();
    },
    onError: (err: any) => {
      message.error(err?.message || '创建失败');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      updateRegion(id, { ...data, parent_id: data.parent_id ?? undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
      queryClient.invalidateQueries({ queryKey: ['regionTree'] });
      message.success('更新成功');
      setEditingRegion(null);
      form.resetFields();
    },
    onError: (err: any) => {
      message.error(err?.message || '更新失败');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRegion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
      queryClient.invalidateQueries({ queryKey: ['regionTree'] });
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
      title: '类型',
      dataIndex: 'region_type',
      key: 'region_type',
      width: 100,
      render: (v) => {
        const map: Record<string, string> = {
          PROVINCE: '省',
          CITY: '市',
          DISTRICT: '区/县',
          STREET: '街道',
          CUSTOM: '自定义',
        };
        return map[v] || v;
      },
    },
    {
      title: '邮编',
      dataIndex: 'postal_code',
      key: 'postal_code',
      width: 100,
    },
    {
      title: '区号',
      dataIndex: 'area_code',
      key: 'area_code',
      width: 100,
    },
    {
      title: '经度',
      dataIndex: 'longitude',
      key: 'longitude',
      width: 100,
      render: (v) => (v != null ? Number(v).toFixed(4) : '-'),
    },
    {
      title: '纬度',
      dataIndex: 'latitude',
      key: 'latitude',
      width: 100,
      render: (v) => (v != null ? Number(v).toFixed(4) : '-'),
    },
    {
      title: '排序',
      dataIndex: 'sort_order',
      key: 'sort_order',
      width: 80,
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
              form.setFieldsValue({
                ...record,
                parent_id: record.parent_id ?? undefined,
              });
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
          <Select
            placeholder="类型筛选"
            style={{ width: 120 }}
            allowClear
            value={regionType}
            onChange={(val) => {
              setRegionType(val);
              setPage(1);
            }}
            options={REGION_TYPE_OPTIONS}
          />
          <TreeSelect
            placeholder="上级地区"
            style={{ width: 220 }}
            allowClear
            treeData={treeSelectData}
            value={parentID}
            onChange={(val) => {
              setParentID(val ?? null);
              setPage(1);
            }}
            showSearch
            treeLine
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
            <Input placeholder="如：110101、440300" />
          </Form.Item>

          <Form.Item
            name="region_type"
            label="地区类型"
            rules={[{ required: true, message: '请选择地区类型' }]}
          >
            <Select placeholder="请选择地区类型" options={REGION_TYPE_OPTIONS} />
          </Form.Item>

          <Form.Item name="parent_id" label="上级地区">
            <TreeSelect
              placeholder="请选择上级地区（可选）"
              treeData={treeSelectData}
              allowClear
              showSearch
              treeLine
            />
          </Form.Item>

          <Form.Item name="sort_order" label="排序" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="postal_code" label="邮编">
            <Input placeholder="如：100000" />
          </Form.Item>

          <Form.Item name="area_code" label="区号">
            <Input placeholder="如：010" />
          </Form.Item>

          <Form.Item name="longitude" label="经度">
            <InputNumber step={0.0001} placeholder="如：116.4074" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="latitude" label="纬度">
            <InputNumber step={0.0001} placeholder="如：39.9042" style={{ width: '100%' }} />
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
            <Input placeholder="如：110101、440300" />
          </Form.Item>

          <Form.Item
            name="region_type"
            label="地区类型"
            rules={[{ required: true, message: '请选择地区类型' }]}
          >
            <Select placeholder="请选择地区类型" options={REGION_TYPE_OPTIONS} />
          </Form.Item>

          <Form.Item name="parent_id" label="上级地区">
            <TreeSelect
              placeholder="请选择上级地区（可选）"
              treeData={treeSelectData}
              allowClear
              showSearch
              treeLine
            />
          </Form.Item>

          <Form.Item name="sort_order" label="排序">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="postal_code" label="邮编">
            <Input placeholder="如：100000" />
          </Form.Item>

          <Form.Item name="area_code" label="区号">
            <Input placeholder="如：010" />
          </Form.Item>

          <Form.Item name="longitude" label="经度">
            <InputNumber step={0.0001} placeholder="如：116.4074" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="latitude" label="纬度">
            <InputNumber step={0.0001} placeholder="如：39.9042" style={{ width: '100%' }} />
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
