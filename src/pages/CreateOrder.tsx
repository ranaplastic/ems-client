import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCreateOrder } from '@/hooks/useOrders';
import { useAuthStore } from '@/store/authStore';
import { extractErrorMessage } from '@/api/client';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Input';
import { PageLoader } from '@/components/ui/Spinner';
import { formatCurrency, todayISO } from '@/lib/format';
import type { CreateOrderRequest } from '@/types';

interface LineDraft {
  key: string;
  productId: number | '';
  quantity: string;
  rate: string;
}

let keySeq = 0;
const newLine = (productId: number | '' = '', rate = ''): LineDraft => ({
  key: `line-${keySeq++}`,
  productId,
  quantity: '1',
  rate,
});

export default function CreateOrder() {
  const navigate = useNavigate();
  const location = useLocation();
  const preselected = (location.state as { productId?: number } | null)?.productId;
  const client = useAuthStore((s) => s.client);
  const { data: products, isLoading } = useProducts();
  const createOrder = useCreateOrder();

  const [date, setDate] = useState(todayISO());
  const [lines, setLines] = useState<LineDraft[]>([newLine()]);
  const [initialised, setInitialised] = useState(false);

  // Pre-fill a line when navigated from the product catalog.
  if (!initialised && preselected && products) {
    const product = products.find((p) => p.productId === preselected);
    if (product) {
      setLines([newLine(product.productId, String(product.rate))]);
    }
    setInitialised(true);
  }

  const total = useMemo(
    () =>
      lines.reduce((sum, l) => {
        const qty = Number(l.quantity) || 0;
        const rate = Number(l.rate) || 0;
        return sum + qty * rate;
      }, 0),
    [lines],
  );

  if (isLoading) return <PageLoader label="Loading products…" />;

  const updateLine = (key: string, patch: Partial<LineDraft>) =>
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const onProductChange = (key: string, productId: number | '') => {
    const product = products?.find((p) => p.productId === productId);
    updateLine(key, { productId, rate: product ? String(product.rate) : '' });
  };

  const removeLine = (key: string) =>
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.key !== key) : prev));

  const validate = (): string | null => {
    if (!client) return 'Session expired. Please sign in again.';
    if (lines.length === 0) return 'Add at least one product.';
    for (const l of lines) {
      if (l.productId === '') return 'Select a product for every line.';
      if (!(Number(l.quantity) > 0)) return 'Quantity must be greater than zero.';
      if (!(Number(l.rate) >= 0)) return 'Rate must be zero or more.';
    }
    const ids = lines.map((l) => l.productId);
    if (new Set(ids).size !== ids.length) return 'Each product can only be added once.';
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    const payload: CreateOrderRequest = {
      clientId: client!.clientId,
      date,
      orderBooks: lines.map((l) => ({
        productId: Number(l.productId),
        quantity: Number(l.quantity),
        rate: Number(l.rate),
      })),
    };
    try {
      const order = await createOrder.mutateAsync(payload);
      toast.success(`Order #${order.orderId} placed successfully!`);
      navigate(`/orders/${order.orderId}`, { replace: true });
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">New Order</h1>
        <p className="text-sm text-slate-500">Add products and quantities to place your order.</p>
      </div>

      <Card>
        <CardBody className="space-y-4">
          <Field label="Order Date" required>
            <Input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </CardBody>
      </Card>

      <div className="space-y-3">
        {lines.map((line, index) => (
          <Card key={line.key}>
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Item {index + 1}</span>
                {lines.length > 1 && (
                  <button
                    onClick={() => removeLine(line.key)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <Field label="Product" required>
                <Select
                  value={line.productId}
                  onChange={(e) =>
                    onProductChange(line.key, e.target.value ? Number(e.target.value) : '')
                  }
                >
                  <option value="">Select a product…</option>
                  {products?.map((p) => (
                    <option key={p.productId} value={p.productId}>
                      {p.productName}
                    </option>
                  ))}
                </Select>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Quantity" required>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={line.quantity}
                    onChange={(e) => updateLine(line.key, { quantity: e.target.value })}
                  />
                </Field>
                <Field label="Rate" required>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={line.rate}
                    onChange={(e) => updateLine(line.key, { rate: e.target.value })}
                  />
                </Field>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                <span className="text-slate-500">Line total</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency((Number(line.quantity) || 0) * (Number(line.rate) || 0))}
                </span>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Button variant="outline" fullWidth onClick={() => setLines((prev) => [...prev, newLine()])}>
        <Plus className="h-4 w-4" />
        Add another item
      </Button>

      <Card>
        <CardBody className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500">Order total</span>
          <span className="text-xl font-bold text-slate-900">{formatCurrency(total)}</span>
        </CardBody>
      </Card>

      <Button fullWidth size="lg" loading={createOrder.isPending} onClick={handleSubmit}>
        <ShoppingCart className="h-4 w-4" />
        Place Order
      </Button>
    </div>
  );
}
