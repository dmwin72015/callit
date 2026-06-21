import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Card,
  Space,
  Button,
  Typography,
  TreeSelect,
  Select,
  Form,
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
import RegionCreateModal from './components/RegionCreateModal';
import RegionEditModal from './components/RegionEditModal';

const { Title } = Typography;

function buildTreeSelectData(nodes: RegionResponse[]): { value: number; title: string; children?: any }[] {
  return nodes.map((node) => ({
    value: node.id,
    title: node.name,
    children: node.children && node.children.length > 0
      ? buildTreeSelectData(node.children)
      : undefined,
  }));
}

export default function RegionListPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [regionType, setRegionType] = useState<string>();
  const [parentID, setParentID] = useState<number | null>(null);
  const [editingRegion, setEditingRegion] = useState<RegionResponse | null>(null);
  const [creatingRegion, setCreatingRegion] = useState(false);
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['regions', { page, pageSize, regionType, parentId: parentID }],
    queryFn: () =>
      getRegions({
        page,
        pageSize,
        regionType,
        parentId: parentID ?? undefined,
      }),
  });

  const { data: treeData } = useQuery({
    queryKey: ['regionTree'],
    queryFn: () => getRegionTree(undefined, 'PROVINCE', 0),
    staleTime: 5 * 60 * 1000,
  });

  const treeSelectData = useMemo(() => {
    if (!treeData) return [];
    return buildTreeSelectData(treeData);
  }, [treeData]);

  const { data: parentTreeData } = useQuery({
    queryKey: ['regionTree', 'parent'],
    queryFn: () => getRegionTree(undefined, 'PROVINCE', 0),
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (values: any) => createRegion({ ...values, parentId: values.parentId ?? undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
      queryClient.invalidateQueries({ queryKey: ['regionTree'] });
      setCreatingRegion(false);
      form.resetFields();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      updateRegion(id, { ...data, parentId: data.parentId ?? undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
      queryClient.invalidateQueries({ queryKey: ['regionTree'] });
      setEditingRegion(null);
      form.resetFields();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRegion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
      queryClient.invalidateQueries({ queryKey: ['regionTree'] });
    },
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
      width: 160,
    },
    {
      title: '代码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: '类型',
      dataIndex: 'regionType',
      key: 'regionType',
      width: 100,
      render: (v) => {
        const map: Record<string, string> = {
          MACRO_REGION: '大区',
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
      dataIndex: 'postalCode',
      key: 'postalCode',
      width: 100,
    },
    {
      title: '区号',
      dataIndex: 'areaCode',
      key: 'areaCode',
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
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
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
              setEditingRegion(record);
              form.setFieldsValue({
                ...record,
                parentId: record.parentId ?? undefined,
              });
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => deleteMutation.mutate(record.id)}
          >
            删除
          </Button>
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
            options={[
              { label: '大区', value: 'MACRO_REGION' },
              { label: '省/直辖市', value: 'PROVINCE' },
              { label: '市', value: 'CITY' },
              { label: '区/县', value: 'DISTRICT' },
              { label: '街道/乡镇', value: 'STREET' },
              { label: '自定义', value: 'CUSTOM' },
            ]}
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

      <RegionCreateModal
        open={creatingRegion}
        form={form}
        parentTreeData={parentTreeData}
        submitting={createMutation.isPending}
        onSubmit={(values) => createMutation.mutate(values)}
        onCancel={() => {
          setCreatingRegion(false);
          form.resetFields();
        }}
      />

      <RegionEditModal
        open={!!editingRegion}
        form={form}
        parentTreeData={parentTreeData}
        submitting={updateMutation.isPending}
        onSubmit={(values) => {
          if (editingRegion) {
            updateMutation.mutate({ id: editingRegion.id, data: values });
          }
        }}
        onCancel={() => {
          setEditingRegion(null);
          form.resetFields();
        }}
      />
    </div>
  );
}
