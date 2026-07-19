import { Outlet } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';

const ITEMS = [
  { label: 'Overview', to: '/admin', end: true },
  { label: 'Orders', to: '/admin/orders' },
  { label: 'Moderation Queue', to: '/admin/moderation' },
  { label: 'Artisans', to: '/admin/artisans' },
  { label: 'Users', to: '/admin/users' },
  { label: 'Categories', to: '/admin/categories' },
];

export default function AdminLayout() {
  return (
    <DashboardLayout title="Admin" items={ITEMS}>
      <Outlet />
    </DashboardLayout>
  );
}
