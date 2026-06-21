import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Card,
  Space,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Typography,
  Tabs,
  App,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { getReviewQueue, approveAlias, rejectAlias } from '../../services/aliases';
import type { AliasResponse } from '../../types';

const { Title } = Typography;

export default function AliasReviewPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [approvingAlias, setApprovingAlias] = useState<AliasResponse | null>(null);
  const [rejectingAlias, setRejectingAlias] = useState<AliasResponse | null>(null);
  const [approveForm] = Form.useForm();
  const [rejectForm] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['aliases', 'review-queue', { page, pageSize, status: activeTab }],
    queryFn: () =>
      getReviewQueue({
        page,
        pageSize,
        status: activeTab,
      }),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data?: { note?: string } }) => approveAlias(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aliases'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      message.success('审核通过');
      setApprovingAlias(null);
      approveForm.resetFields();
    },
    onError: () => message.error('审核失败'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { reason: string } }) => rejectAlias(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aliases'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      message.success('已拒绝');
      setRejectingAlias(null);
      rejectForm.resetFields();
    },
    onError: () => message.error('操作失败'),
  });

  const columns: ColumnsType<AliasResponse> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
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
      title: '提交者',
      dataIndex: 'submittedBy',
      key: 'submittedBy',
    },
    {
      title: '投票数',
      dataIndex: 'votesCount',
      key: 'votesCount',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const colors = { PENDING: 'orange', APPROVED: 'green', REJECTED: 'red' };
        const labels = { PENDING: '待审核', APPROVED: '已通过', REJECTED: '已拒绝' };
        return <Tag color={colors[status as keyof typeof colors]}>{labels[status as keyof typeof labels]}</Tag>;
      },
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
      render: (_, record) =>
        record.status === 'PENDING' ? (
          <Space>
            <Button
              type="link"
              icon={<CheckCircleOutlined />}
              onClick={() => {
                setApprovingAlias(record);
                approveForm.resetFields();
              }}
            >
              通过
            </Button>
            <Button
              type="link"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => {
                setRejectingAlias(record);
                rejectForm.resetFields();
              }}
            >
              拒绝
            </Button>
          </Space>
        ) : null,
    },
  ];

  const tabItems = [
    { key: 'PENDING', label: `待审核` },
    { key: 'APPROVED', label: '已通过' },
    { key: 'REJECTED', label: '已拒绝' },
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>别名审核</Title>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key as 'PENDING' | 'APPROVED' | 'REJECTED');
            setPage(1);
          }}
          items={tabItems}
          style={{ marginBottom: 16 }}
        />

        <Table<AliasResponse>
          columns={columns}
          dataSource={data?.items || []}
          rowKey="id"
          loading={isLoading || approveMutation.isPending || rejectMutation.isPending}
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
        title="通过审核"
        open={!!approvingAlias}
        onCancel={() => {
          setApprovingAlias(null);
          approveForm.resetFields();
        }}
        footer={null}
      >
        <Form form={approveForm} layout="vertical" onFinish={(values) => approveMutation.mutate({ id: approvingAlias!.id, data: values })}>
          <div style={{ marginBottom: 16 }}>
            <strong>别名：</strong>{approvingAlias?.aliasName}
            <br />
            <strong>物品：</strong>{approvingAlias?.itemName}
            <br />
            <strong>地区：</strong>{approvingAlias?.regionName}
          </div>
          <Form.Item name="note" label="备注">
            <Input.TextArea rows={3} placeholder="可选：添加审核备注" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={approveMutation.isPending}>
                确认通过
              </Button>
              <Button onClick={() => setApprovingAlias(null)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="拒绝审核"
        open={!!rejectingAlias}
        onCancel={() => {
          setRejectingAlias(null);
          rejectForm.resetFields();
        }}
        footer={null}
      >
        <Form form={rejectForm} layout="vertical" onFinish={(values) => rejectMutation.mutate({ id: rejectingAlias!.id, data: values })}>
          <div style={{ marginBottom: 16 }}>
            <strong>别名：</strong>{rejectingAlias?.aliasName}
            <br />
            <strong>物品：</strong>{rejectingAlias?.itemName}
            <br />
            <strong>地区：</strong>{rejectingAlias?.regionName}
          </div>
          <Form.Item name="reason" label="拒绝原因" rules={[{ required: true, message: '请输入拒绝原因' }]}>
            <Input.TextArea rows={3} placeholder="请输入拒绝原因" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" danger htmlType="submit" loading={rejectMutation.isPending}>
                确认拒绝
              </Button>
              <Button onClick={() => setRejectingAlias(null)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
