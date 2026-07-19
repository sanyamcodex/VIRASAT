import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthBootstrap from './components/AuthBootstrap';
import ProtectedRoute from './components/ProtectedRoute';
import PagePlaceholder from './components/PagePlaceholder';
import StorefrontLayout from './layouts/StorefrontLayout';
import ArtisanLayout from './layouts/ArtisanLayout';
import AdminLayout from './layouts/AdminLayout';

// Storefront pages (Phase 7)
import Home from './pages/storefront/Home';
import Shop from './pages/storefront/Shop';
import ArtForms from './pages/storefront/ArtForms';
import ProductDetail from './pages/storefront/ProductDetail';
import ArtisanStory from './pages/storefront/ArtisanStory';
import Cart from './pages/storefront/Cart';
import Checkout from './pages/storefront/Checkout';
import Orders from './pages/storefront/Orders';
import Login from './pages/storefront/Login';
import Register from './pages/storefront/Register';
import Wishlist from './pages/storefront/Wishlist';

// Artisan dashboard pages (Phase 8)
import ArtisanOverview from './pages/artisan/Overview';
import ArtisanProducts from './pages/artisan/Products';
import ArtisanProductForm from './pages/artisan/ProductForm';
import ArtisanProfile from './pages/artisan/Profile';
import ArtisanOrders from './pages/artisan/Orders';
import ArtisanNotifications from './pages/artisan/Notifications';

// Placeholder helper — admin pages land in Phase 9.
const P = (title, subtitle) => <PagePlaceholder title={title} subtitle={subtitle} />;

export default function App() {
  return (
    <BrowserRouter>
      <AuthBootstrap>
        <Routes>
          {/* ---------- Public storefront (User) ---------- */}
          <Route element={<StorefrontLayout />}>
            <Route index element={<Home />} />
            <Route path="art-forms" element={<ArtForms />} />
            <Route path="shop" element={<Shop />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="artisans/:id" element={<ArtisanStory />} />
            <Route path="cart" element={<Cart />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            {/* Buyer-only */}
            <Route element={<ProtectedRoute roles={['user']} />}>
              <Route path="checkout" element={<Checkout />} />
              <Route path="orders" element={<Orders />} />
              <Route path="wishlist" element={<Wishlist />} />
            </Route>
          </Route>

          {/* ---------- Artisan dashboard ---------- */}
          <Route element={<ProtectedRoute roles={['artisan']} />}>
            <Route path="/artisan" element={<ArtisanLayout />}>
              <Route index element={<ArtisanOverview />} />
              <Route path="products" element={<ArtisanProducts />} />
              <Route path="products/new" element={<ArtisanProductForm />} />
              <Route path="products/:id/edit" element={<ArtisanProductForm />} />
              <Route path="profile" element={<ArtisanProfile />} />
              <Route path="orders" element={<ArtisanOrders />} />
              <Route path="notifications" element={<ArtisanNotifications />} />
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
