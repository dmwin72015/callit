import { Modal, Form, Input, Button, Space } from 'antd';

interface TagFormModalProps {
  open: boolean;
  form: any;
  submitting: boolean;
  isEdit?: boolean;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

export default function TagFormModal({
  open,
  form,
  submitting,
  isEdit = false,
  onSubmit,
  onCancel,
}: TagFormModalProps) {
  return (
    <Modal
      title={isEdit ? '编辑标签' : '新增标签'}
      open={open}
      onCancel={onCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
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
