import { Modal, Form, Button, Space } from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { RegionResponse } from '../../../types';
import RegionFormFields from './RegionFormFields';

interface RegionEditModalProps {
  open: boolean;
  form: FormInstance;
  parentTreeData: RegionResponse[] | undefined;
  submitting: boolean;
  onSubmit: (values: Record<string, unknown>) => void;
  onCancel: () => void;
}

export default function RegionEditModal({
  open,
  form,
  parentTreeData,
  submitting,
  onSubmit,
  onCancel,
}: RegionEditModalProps) {
  return (
    <Modal
      title="编辑地区"
      open={open}
      onCancel={onCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <RegionFormFields parentTreeData={parentTreeData} />

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
