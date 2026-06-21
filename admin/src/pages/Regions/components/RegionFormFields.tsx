import { Form, Input, InputNumber, Select, Row, Col, TreeSelect } from 'antd';
import type { RegionResponse } from '../../../types';

const REGION_TYPE_OPTIONS = [
  { label: '大区', value: 'MACRO_REGION' },
  { label: '省/直辖市', value: 'PROVINCE' },
  { label: '市', value: 'CITY' },
  { label: '区/县', value: 'DISTRICT' },
  { label: '街道/乡镇', value: 'STREET' },
  { label: '自定义', value: 'CUSTOM' },
];

function buildTreeSelectData(nodes: RegionResponse[]): { value: number; title: string; children?: any }[] {
  return nodes.map((node) => ({
    value: node.id,
    title: node.name,
    children: node.children && node.children.length > 0
      ? buildTreeSelectData(node.children)
      : undefined,
  }));
}

interface RegionFormFieldsProps {
  parentTreeData: RegionResponse[] | undefined;
}

export default function RegionFormFields({ parentTreeData }: RegionFormFieldsProps) {
  const parentTreeSelectData = buildTreeSelectData(parentTreeData || []);

  return (
    <Row gutter={16}>
      <Col span={12}>
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
          name="regionType"
          label="地区类型"
          rules={[{ required: true, message: '请选择地区类型' }]}
        >
          <Select placeholder="请选择地区类型" options={REGION_TYPE_OPTIONS} />
        </Form.Item>

        <Form.Item name="parentId" label="上级地区">
          <TreeSelect
            placeholder="请选择上级地区（可选）"
            treeData={parentTreeSelectData}
            allowClear
            showSearch
            treeLine
          />
        </Form.Item>

        <Form.Item name="sortOrder" label="排序" initialValue={0}>
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item name="postalCode" label="邮编">
          <Input placeholder="如：100000" />
        </Form.Item>

        <Form.Item name="areaCode" label="区号">
          <Input placeholder="如：010" />
        </Form.Item>

        <Form.Item name="longitude" label="经度">
          <InputNumber step={0.0001} placeholder="如：116.4074" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="latitude" label="纬度">
          <InputNumber step={0.0001} placeholder="如：39.9042" style={{ width: '100%' }} />
        </Form.Item>
      </Col>
    </Row>
  );
}
