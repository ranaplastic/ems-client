import { Link } from 'react-router-dom';
import {
  Wallet,
  ShoppingCart,
  Clock,
  CheckCircle2,
  ArrowRight,
  Plus,
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
import { formatCurrency } from '@/lib/format';

export default function Dashboard() {
  const client = useAuthStore((s) => s.client);
  const { data: orders, isLoading } = useOrders();
  const { data: receivable } = useReceivable();

  if (isLoading) return <PageLoader />;

  const list = orders ?? [];
  const openOrders = list.filter((o) => o.status === 'CREATED').length;
  const completedOrders = list.filter((o) => o.status === 'COMPLETED').length;
  // Outstanding = unpaid balance across every non-cancelled order.
  // The server-side receivable only tracks COMPLETED orders, so we fall back
  // to the live order list to include CREATED orders that still owe money.
  const outstandingFromOrders = list
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + Math.max(0, (o.totalAmount ?? 0) - (o.paidAmount ?? 0)), 0);
  const outstanding = Math.max(receivable?.totalDue ?? 0, outstandingFromOrders);
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
                      <p className="text-xs text-slate-400">
                        {order.orderBooks?.length ?? 0} item{(order.orderBooks?.length ?? 0) === 1 ? '' : 's'}
                      </p>
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
