import { Link } from 'react-router-dom';
import {
  Wallet,
  ShoppingCart,
  Clock,
  CheckCircle2,
  ArrowRight,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useOrders } from '@/hooks/useOrders';
import { useReceivable } from '@/hooks/useReceivable';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { formatCurrency, formatDate } from '@/lib/format';

export default function Dashboard() {
  const client = useAuthStore((s) => s.client);
  const { data: orders, isLoading } = useOrders();
  const { data: receivable } = useReceivable();

  if (isLoading) return <PageLoader />;

  const list = orders ?? [];
  const openOrders = list.filter((o) => o.status === 'CREATED').length;
  const completedOrders = list.filter((o) => o.status === 'COMPLETED').length;
  const outstanding = receivable?.totalDue ?? 0;
  const recent = [...list]
    .sort((a, b) => b.orderId - a.orderId)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Welcome back,</p>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{client?.name}</h1>
        </div>
        <ButtonLink to="/orders/new">
          <Plus className="h-4 w-4" />
          New Order
        </ButtonLink>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Outstanding"
          value={formatCurrency(outstanding)}
          icon={Wallet}
          tone={outstanding > 0 ? 'red' : 'emerald'}
        />
        <StatCard label="Total Orders" value={String(list.length)} icon={ShoppingCart} />
        <StatCard label="Open Orders" value={String(openOrders)} icon={Clock} tone="amber" />
        <StatCard
          label="Completed"
          value={String(completedOrders)}
          icon={CheckCircle2}
          tone="emerald"
        />
      </div>

      {outstanding > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">
              You have an outstanding balance of {formatCurrency(outstanding)}.
            </p>
            <Link
              to="/payments/new"
              className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:underline"
            >
              Make a payment <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Recent Orders</h2>
          <Link
            to="/orders"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardBody className="p-0">
          {recent.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={ShoppingCart}
                title="No orders yet"
                description="When you place your first order it will appear here."
                action={<ButtonLink to="/orders/new">Place an order</ButtonLink>}
              />
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((order) => (
                <li key={order.orderId}>
                  <Link
                    to={`/orders/${order.orderId}`}
                    className="flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50 sm:px-5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">Order #{order.orderId}</p>
                      <p className="text-xs text-slate-400">{formatDate(order.date)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">
                          {formatCurrency(order.totalAmount)}
                        </p>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-300" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
