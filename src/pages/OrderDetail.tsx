import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, CreditCard, XCircle, Package } from 'lucide-react';
import { useOrder, useCancelOrder } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { extractErrorMessage } from '@/api/client';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { formatCurrency, formatDate, formatQuantity } from '@/lib/format';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);
  const navigate = useNavigate();
  const { data: order, isLoading, isError } = useOrder(orderId);
  const { data: products } = useProducts();
  const cancelOrder = useCancelOrder();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading) return <PageLoader label="Loading order…" />;

  if (isError || !order) {
    return (
      <div className="space-y-4">
        <BackLink />
        <EmptyState icon={Package} title="Order not found" description="This order may have been removed." />
      </div>
    );
  }

  const productName = (productId: number) =>
    products?.find((p) => p.productId === productId)?.productName ?? `Product #${productId}`;

  const balanceDue = order.totalAmount - order.paidAmount;

  const handleCancel = async () => {
    try {
      await cancelOrder.mutateAsync(orderId);
      toast.success('Order cancelled.');
      setConfirmOpen(false);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="space-y-5">
      <BackLink />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Order #{order.orderId}</h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="text-sm text-slate-400">{formatDate(order.date)}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryTile label="Total" value={formatCurrency(order.totalAmount)} />
        <SummaryTile label="Paid" value={formatCurrency(order.paidAmount)} tone="emerald" />
        <SummaryTile
          label="Balance Due"
          value={formatCurrency(balanceDue)}
          tone={balanceDue > 0 ? 'red' : 'emerald'}
        />
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-900">Order Items</h2>
        </CardHeader>
        <CardBody className="p-0">
          <ul className="divide-y divide-slate-100">
            {order.orderBooks?.map((line) => (
              <li key={line.serialNo} className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">
                      {line.productName ?? productName(line.productId)}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {formatQuantity(line.quantity)} × {formatCurrency(line.rate)}
                    </p>
                  </div>
                  <p className="font-semibold text-slate-900">{formatCurrency(line.lineTotal)}</p>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>Fulfilled: {formatQuantity(line.quantityFulfilled)}</span>
                  {line.quantityForProduction > 0 && (
                    <span className="text-amber-600">
                      In production: {formatQuantity(line.quantityForProduction)}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      {order.status === 'CREATED' && (
        <div className="flex flex-col gap-3 sm:flex-row">
          {balanceDue > 0 && (
            <ButtonLink
              to="/payments/new"
              state={{ orderId: order.orderId, amount: balanceDue }}
              fullWidth
            >
              <CreditCard className="h-4 w-4" />
              Pay {formatCurrency(balanceDue)}
            </ButtonLink>
          )}
          <Button variant="danger" fullWidth onClick={() => setConfirmOpen(true)}>
            <XCircle className="h-4 w-4" />
            Cancel Order
          </Button>
        </div>
      )}

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Cancel this order?">
        <p className="text-sm text-slate-500">
          This will cancel order #{order.orderId}. This action cannot be undone.
        </p>
        <div className="mt-5 flex gap-3">
          <Button variant="outline" fullWidth onClick={() => setConfirmOpen(false)}>
            Keep order
          </Button>
          <Button variant="danger" fullWidth loading={cancelOrder.isPending} onClick={handleCancel}>
            Cancel order
          </Button>
        </div>
      </Modal>
    </div>
  );

  function BackLink() {
    return (
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
    );
  }
}

function SummaryTile({
  label,
  value,
  tone = 'slate',
}: {
  label: string;
  value: string;
  tone?: 'slate' | 'emerald' | 'red';
}) {
  const tones = {
    slate: 'text-slate-900',
    emerald: 'text-emerald-600',
    red: 'text-red-600',
  } as const;
  return (
    <Card>
      <CardBody>
        <p className="text-xs text-slate-400">{label}</p>
        <p className={`mt-1 text-lg font-semibold ${tones[tone]}`}>{value}</p>
      </CardBody>
    </Card>
  );
}

export { OrderDetail };
