import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Plus, ArrowRight } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { Card, CardBody } from '@/components/ui/Card';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { cn } from '@/lib/cn';
import { formatCurrency, formatDate } from '@/lib/format';
import type { OrderStatus } from '@/types';

const FILTERS: { label: string; value: OrderStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Open', value: 'CREATED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export default function Orders() {
  const { data: orders, isLoading } = useOrders();
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');

  const filtered = useMemo(() => {
    const list = [...(orders ?? [])].sort((a, b) => b.orderId - a.orderId);
    return filter === 'ALL' ? list : list.filter((o) => o.status === filter);
  }, [orders, filter]);

  if (isLoading) return <PageLoader label="Loading orders…" />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">My Orders</h1>
          <p className="text-sm text-slate-500">Track and manage your orders.</p>
        </div>
        <ButtonLink to="/orders/new">
          <Plus className="h-4 w-4" />
          New Order
        </ButtonLink>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              filter === f.value
                ? 'bg-brand-600 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No orders here"
          description="Orders matching this filter will show up here."
          action={<ButtonLink to="/orders/new">Place an order</ButtonLink>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <Card key={order.orderId}>
              <CardBody className="p-0">
                <Link
                  to={`/orders/${order.orderId}`}
                  className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-slate-50 sm:p-5"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900">Order #{order.orderId}</p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {formatDate(order.date)} · {order.orderBooks?.length ?? 0} item(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      {order.status !== 'CANCELLED' &&
                        order.totalAmount - order.paidAmount > 0 && (
                          <p className="text-xs text-red-500">
                            {formatCurrency(order.totalAmount - order.paidAmount)} due
                          </p>
                        )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300" />
                  </div>
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
