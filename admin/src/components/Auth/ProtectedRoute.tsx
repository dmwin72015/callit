import { Result, Button } from 'antd';
import { useAuthStore } from '../../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = true,
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin } = useAuthStore();

  if (!isAuthenticated()) {
    // Use window.location for full page redirect to ensure basename is preserved
    const loginPath = '/admin/login';
    const currentPath = window.location.pathname + window.location.search;
    window.location.href = `${loginPath}?from=${encodeURIComponent(currentPath)}`;
    return null;
  }

  if (requireAdmin && !isAdmin()) {
    return (
      <Result
        status="403"
        title="权限不足"
        subTitle="您没有权限访问此页面"
        extra={<Button type="primary" onClick={() => window.history.back()}>返回</Button>}
      />
    );
  }

  return <>{children}</>;
}
