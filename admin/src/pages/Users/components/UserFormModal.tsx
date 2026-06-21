import { Modal, Form, Input, Select, Button, Space } from 'antd';

interface UserFormModalProps {
  open: boolean;
  form: any;
  submitting: boolean;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

export default function UserFormModal({
  open,
  form,
  submitting,
  onSubmit,
  onCancel,
}: UserFormModalProps) {
  return (
    <Modal
      title="编辑用户"
      open={open}
      onCancel={onCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="role" label="角色" rules={[{ required: true }]}>
          <Select
            options={[
              { value: 'ADMIN', label: '管理员' },
              { value: 'USER', label: '用户' },
            ]}
          />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={submitting}>
              保存
            </Button>
            <Button onClick={onCancel}>取消</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
