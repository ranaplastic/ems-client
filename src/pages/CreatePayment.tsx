import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { useCreatePayment } from '@/hooks/usePayments';
import { useReceivable } from '@/hooks/useReceivable';
import { useAuthStore } from '@/store/authStore';
import { extractErrorMessage } from '@/api/client';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Input';
import { formatCurrency, todayISO } from '@/lib/format';
import type { CreatePaymentRequest, PaymentMode } from '@/types';

const MODES: PaymentMode[] = ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CHEQUE'];
const MODE_LABELS: Record<PaymentMode, string> = {
  CASH: 'Cash',
  UPI: 'UPI',
  CARD: 'Card',
  BANK_TRANSFER: 'Bank Transfer',
  CHEQUE: 'Cheque',
};

export default function CreatePayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = location.state as { orderId?: number; amount?: number } | null;
  const client = useAuthStore((s) => s.client);
  const { data: receivable } = useReceivable();
  const createPayment = useCreatePayment();

  const [amount, setAmount] = useState(prefill?.amount ? String(prefill.amount) : '');
  const [mode, setMode] = useState<PaymentMode>('UPI');
  const [date, setDate] = useState(todayISO());
  const [remarks, setRemarks] = useState('');

  const outstanding = receivable?.totalDue ?? 0;

  const handleSubmit = async () => {
    if (!client) {
      toast.error('Session expired. Please sign in again.');
      return;
    }
    const value = Number(amount);
    if (!(value > 0)) {
      toast.error('Enter a payment amount greater than zero.');
      return;
    }
    if (outstanding > 0 && value > outstanding) {
      toast.error(`Amount exceeds outstanding balance of ${formatCurrency(outstanding)}.`);
      return;
    }

    const payload: CreatePaymentRequest = {
      clientId: client.clientId,
      orderId: prefill?.orderId ?? null,
      paymentDate: date,
      amountPaid: value,
      paymentMode: mode,
      remarks: remarks.trim() || null,
    };
    try {
      await createPayment.mutateAsync(payload);
      toast.success('Payment recorded successfully!');
      navigate('/payments', { replace: true });
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Make a Payment</h1>
        <p className="text-sm text-slate-500">
          {prefill?.orderId ? `Payment towards Order #${prefill.orderId}.` : 'Record a payment.'}
        </p>
      </div>

      {outstanding > 0 && (
        <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4">
          <p className="text-sm text-brand-700">
            Outstanding balance: <strong>{formatCurrency(outstanding)}</strong>
          </p>
        </div>
      )}

      <Card>
        <CardBody className="space-y-4">
          <Field label="Amount" required hint={outstanding > 0 ? `Max ${formatCurrency(outstanding)}` : undefined}>
            <Input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>

          <Field label="Payment Mode" required>
            <Select value={mode} onChange={(e) => setMode(e.target.value as PaymentMode)}>
              {MODES.map((m) => (
                <option key={m} value={m}>
                  {MODE_LABELS[m]}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Payment Date" required>
            <Input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
          </Field>

          <Field label="Remarks">
            <Textarea
              rows={3}
              placeholder="Optional note (e.g. UPI reference)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </Field>
        </CardBody>
      </Card>

      <Button fullWidth size="lg" loading={createPayment.isPending} onClick={handleSubmit}>
        <CreditCard className="h-4 w-4" />
        Pay {amount ? formatCurrency(Number(amount)) : ''}
      </Button>
    </div>
  );
}
