import { createBrowserRouter, Navigate } from 'react-router';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminLayout from './components/Layout/AdminLayout';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import LoginPage from './pages/Login/LoginPage';
import NotFoundPage from './pages/NotFound/NotFoundPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import UserListPage from './pages/Users/UserListPage';
import UserEditPage from './pages/Users/UserEditPage';
import AliasReviewPage from './pages/Aliases/AliasReviewPage';
import AliasListPage from './pages/Aliases/AliasListPage';
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
          <ErrorBoundary>
            <AdminLayout />
          </ErrorBoundary>
        </ProtectedRoute>
      ),
      errorElement: <NotFoundPage />,
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: 'dashboard', element: <DashboardPage /> },
        { path: 'users', element: <UserListPage /> },
        { path: 'users/:id', element: <UserEditPage /> },
        { path: 'aliases', element: <AliasListPage /> },
        { path: 'aliases/review', element: <AliasReviewPage /> },
        { path: 'items', element: <ItemListPage /> },
        { path: 'items/:id', element: <ItemEditPage /> },
        { path: 'categories', element: <CategoryListPage /> },
        { path: 'regions', element: <RegionListPage /> },
        { path: 'tags', element: <TagListPage /> },
        { path: 'audit-logs', element: <AuditLogPage /> },
      ],
    },
    { path: '*', element: <NotFoundPage /> },
  ],
  {
    basename: '/admin',
  }
);

export default router;
