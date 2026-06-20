import { Layout, Dropdown, Avatar, Space } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../../stores/authStore';
import type { MenuProps } from 'antd';

const { Header } = Layout;

export default function AdminHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const menuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  return (
    <Header
      style={{
        padding: '0 24px',
        background: '#fff',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      }}
    >
      <Dropdown menu={{ items: menuItems }} placement="bottomRight">
        <Space style={{ cursor: 'pointer' }}>
          <Avatar icon={<UserOutlined />} />
          <span>{user?.username || user?.email}</span>
        </Space>
      </Dropdown>
    </Header>
  );
}
