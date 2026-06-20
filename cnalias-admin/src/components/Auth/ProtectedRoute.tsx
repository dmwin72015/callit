import { Navigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuthStore();

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
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
