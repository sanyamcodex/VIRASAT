import { Outlet } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';

const ITEMS = [
  { label: 'Overview', to: '/artisan', end: true },
  { label: 'My Products', to: '/artisan/products' },
  { label: 'Add Product', to: '/artisan/products/new' },
  { label: 'Story & Profile', to: '/artisan/profile' },
  { label: 'Orders', to: '/artisan/orders' },
  { label: 'Notifications', to: '/artisan/notifications' },
];

export default function ArtisanLayout() {
  return (
    <DashboardLayout title="Artisan" items={ITEMS} loginPath="/artisan/login">
      <Outlet />
    </DashboardLayout>
  );
}
