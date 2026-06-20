import { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  AuditOutlined,
  FileTextOutlined,
  ApartmentOutlined,
  GlobalOutlined,
  TagOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '看板' },
  { key: '/aliases', icon: <AuditOutlined />, label: '别名审核' },
  { key: '/users', icon: <UserOutlined />, label: '用户管理' },
  { key: '/items', icon: <FileTextOutlined />, label: '物品管理' },
  { key: '/categories', icon: <ApartmentOutlined />, label: '分类管理' },
  { key: '/regions', icon: <GlobalOutlined />, label: '地区管理' },
  { key: '/tags', icon: <TagOutlined />, label: '标签管理' },
  { key: '/audit-logs', icon: <TeamOutlined />, label: '审计日志' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const {
    token: { colorBgContainer: _unused },
  } = theme.useToken();
  void _unused; // Suppress unused warning

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      theme="dark"
      width={200}
      style={{ height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0 }}
    >
      <div
        className="h-16 flex items-center justify-center text-white text-xl font-bold"
        style={{ background: 'rgba(255,255,255,0.1)' }}
      >
        {collapsed ? 'CN' : 'callit 管理后台'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{ marginTop: '1px' }}
      />
    </Sider>
  );
}
