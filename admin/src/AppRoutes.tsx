import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminLayout from './components/Layout/AdminLayout';
import LoginPage from './pages/Login/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import UserListPage from './pages/Users/UserListPage';
import UserEditPage from './pages/Users/UserEditPage';
import AliasReviewPage from './pages/Aliases/AliasReviewPage';
import ItemListPage from './pages/Items/ItemListPage';
import ItemEditPage from './pages/Items/ItemEditPage';
import CategoryListPage from './pages/Categories/CategoryListPage';
import RegionListPage from './pages/Regions/RegionListPage';
import TagListPage from './pages/Tags/TagListPage';
import AuditLogPage from './pages/AuditLogs/AuditLogPage';

const router = createBrowserRouter(
  [
    { path: '/login', element: <LoginPage /> },
    {
      path: '/',
      element: (
        <ProtectedRoute requireAdmin>
          <AdminLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: 'dashboard', element: <DashboardPage /> },
        { path: 'users', element: <UserListPage /> },
        { path: 'users/:id', element: <UserEditPage /> },
        { path: 'aliases', element: <AliasReviewPage /> },
        { path: 'items', element: <ItemListPage /> },
        { path: 'items/:id', element: <ItemEditPage /> },
        { path: 'categories', element: <CategoryListPage /> },
        { path: 'regions', element: <RegionListPage /> },
        { path: 'tags', element: <TagListPage /> },
        { path: 'audit-logs', element: <AuditLogPage /> },
      ],
    },
  ],
  {
    basename: '/admin',
  }
);

export default router;
