import { Modal, Form, Input, Button, Space } from 'antd';

interface CategoryFormModalProps {
  open: boolean;
  form: any;
  submitting: boolean;
  isEdit?: boolean;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

export default function CategoryFormModal({
  open,
  form,
  submitting,
  isEdit = false,
  onSubmit,
  onCancel,
}: CategoryFormModalProps) {
  return (
    <Modal
      title={isEdit ? '编辑分类' : '新增分类'}
      open={open}
      onCancel={onCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="name"
          label="分类名称"
          rules={[{ required: true, message: '请输入分类名称' }]}
        >
          <Input placeholder="请输入分类名称" />
        </Form.Item>

        <Form.Item name="description" label="描述">
          <Input.TextArea rows={3} placeholder="请输入分类描述" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {isEdit ? '保存' : '创建'}
            </Button>
            <Button onClick={onCancel}>取消</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
