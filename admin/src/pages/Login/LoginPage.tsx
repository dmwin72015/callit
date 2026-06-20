import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { auth } from '../../services/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Support both location.state and URL query params for redirect
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname
    || searchParams.get('from')
    || '/dashboard';

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      // 1. 调用登录接口
      const data = await auth.login(values.email, values.password);

      // 2. 保存 tokens
      auth.setTokens(data);

      // 3. 检查用户信息
      console.log('登录返回的 user:', data.user);

      if (!data.user) {
        message.error('登录失败：未获取到用户信息');
        return;
      }

      // 4. 更新 Zustand store
      useAuthStore.setState({
        token: data.access_token,
        user: data.user,
      });

      // 5. 判断权限
      console.log('用户角色:', data.user.role);
      console.log('是否是管理员:', data.user.role === 'ADMIN');

      if (data.user.role !== 'ADMIN') {
        message.error('权限不足：不是管理员账号');
        return;
      }

      message.success('登录成功');
      navigate(from, { replace: true });
    } catch (error: unknown) {
      message.error(error instanceof Error ? error.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  // Don't auto-redirect if we're on the login page
  // This prevents redirect loops
  if (isAuthenticated() && window.location.pathname !== '/admin/login') {
    navigate(from, { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-96 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">callit 管理后台</h1>
          <p className="text-gray-500">管理员登录</p>
        </div>
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
          initialValues={{
            email: 'admin@test.com',
            password: 'Test1234',
          }}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '邮箱格式不正确' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="邮箱" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
