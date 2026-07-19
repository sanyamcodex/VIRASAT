import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthBootstrap from './components/AuthBootstrap';
import ProtectedRoute from './components/ProtectedRoute';
import PagePlaceholder from './components/PagePlaceholder';
import StorefrontLayout from './layouts/StorefrontLayout';
import ArtisanLayout from './layouts/ArtisanLayout';
import AdminLayout from './layouts/AdminLayout';

// Placeholder helper — real pages land in Phases 7–9.
const P = (title, subtitle) => <PagePlaceholder title={title} subtitle={subtitle} />;

export default function App() {
  return (
    <BrowserRouter>
      <AuthBootstrap>
        <Routes>
          {/* ---------- Public storefront (User) ---------- */}
          <Route element={<StorefrontLayout />}>
            <Route index element={P('VIRASAT', 'Where India’s craft heritage meets you.')} />
            <Route path="art-forms" element={P('Art Forms')} />
            <Route path="shop" element={P('Shop')} />
            <Route path="product/:id" element={P('Product Detail')} />
            <Route path="artisans/:id" element={P('Artisan Story')} />
            <Route path="cart" element={P('Cart')} />
            <Route path="login" element={P('Log in')} />
            <Route path="register" element={P('Create account')} />

            {/* Buyer-only */}
            <Route element={<ProtectedRoute roles={['user']} />}>
              <Route path="checkout" element={P('Checkout')} />
              <Route path="orders" element={P('My Orders')} />
              <Route path="wishlist" element={P('Wishlist')} />
            </Route>
          </Route>

          {/* ---------- Artisan dashboard ---------- */}
          <Route element={<ProtectedRoute roles={['artisan']} />}>
            <Route path="/artisan" element={<ArtisanLayout />}>
              <Route index element={P('Sales Overview')} />
              <Route path="products" element={P('My Products')} />
              <Route path="products/new" element={P('Add Product')} />
              <Route path="profile" element={P('Story & Profile')} />
              <Route path="orders" element={P('Order Fulfillment')} />
              <Route path="notifications" element={P('Notifications')} />
            </Route>
          </Route>

          {/* ---------- Admin dashboard ---------- */}
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={P('Platform Overview')} />
              <Route path="orders" element={P('Order Management')} />
              <Route path="moderation" element={P('Moderation Queue')} />
              <Route path="artisans" element={P('Artisan Approvals')} />
              <Route path="users" element={P('User Management')} />
              <Route path="categories" element={P('Category Management')} />
            </Route>
          </Route>

          <Route path="*" element={P('404', 'This page does not exist.')} />
        </Routes>
      </AuthBootstrap>
    </BrowserRouter>
  );
}
