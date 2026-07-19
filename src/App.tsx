import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Products from '@/pages/Products';
import Orders from '@/pages/Orders';
import OrderDetail from '@/pages/OrderDetail';
import CreateOrder from '@/pages/CreateOrder';
import Payments from '@/pages/Payments';
import Receivables from '@/pages/Receivables';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/new" element={<CreateOrder />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/payments/new" element={<Navigate to="/payments" replace />} />
            <Route path="/receivables" element={<Receivables />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}
