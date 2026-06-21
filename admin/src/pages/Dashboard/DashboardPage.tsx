import { useQuery } from '@tanstack/react-query';
import { Card, Col, Row, Statistic, Spin, Alert } from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  AuditOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { getStats } from '../../services/stats';

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="加载失败"
        description="无法加载统计数据"
        type="error"
        showIcon
      />
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">看板</h1>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={stats?.totalUsers || 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总物品数"
              value={stats?.totalItems || 0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总别名数"
              value={stats?.totalAliases || 0}
              prefix={<AuditOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待审核"
              value={stats?.pendingReviews || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Alert
        message="提示"
        description="更多图表和统计功能将在后续版本中添加"
        type="info"
        showIcon
        className="mt-6"
      />
    </div>
  );
}
