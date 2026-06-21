import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Space,
  App,
  Typography,
} from 'antd';
import { getItem, createItem, updateItem } from '../../services/items';
import { getCategories } from '../../services/categories';
import type { ItemResponse } from '../../types';

const { Title } = Typography;

export default function ItemEditPage() {
  const { message } = App.useApp();
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const isNew = id === 'new';

  if (!isNew && !id) {
    return null;
  }

  const { data: categoriesData } = useQuery({
    queryKey: ['categories', { page: 1, pageSize: 100 }],
    queryFn: () => getCategories({ page: 1, pageSize: 100 }),
  });

  const { data: item } = useQuery({
    queryKey: ['items', id],
    queryFn: () => getItem(Number(id)),
    enabled: !isNew && !!id,
  });

  const createMutation = useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      message.success('创建成功');
      navigate('/items');
    },
    onError: () => message.error('创建失败'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ItemResponse> }) =>
      updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      message.success('更新成功');
      navigate('/items');
    },
    onError: () => message.error('更新失败'),
  });

  useEffect(() => {
    if (item) {
      form.setFieldsValue(item);
    }
  }, [item, form]);

  const onFinish = (values: { name: string; description?: string; categoryId: number }) => {
    if (isNew) {
      createMutation.mutate(values);
    } else if (id) {
      updateMutation.mutate({ id: Number(id), data: values });
    }
  };

  const categoryOptions =
    categoriesData?.items.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })) || [];

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        {isNew ? '新增物品' : '编辑物品'}
      </Title>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ name: '', description: '', categoryId: undefined }}
        >
          <Form.Item
            name="name"
            label="物品名称"
            rules={[{ required: true, message: '请输入物品名称' }]}
          >
            <Input placeholder="请输入物品名称" />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <Input.TextArea rows={4} placeholder="请输入物品描述" />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select
              placeholder="请选择分类"
              options={categoryOptions}
              loading={!categoriesData}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {isNew ? '创建' : '保存'}
              </Button>
              <Button onClick={() => navigate('/items')}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
