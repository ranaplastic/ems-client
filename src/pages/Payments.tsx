import { CreditCard, Plus, Banknote } from 'lucide-react';
import { usePayments } from '@/hooks/usePayments';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate, humanize } from '@/lib/format';

export default function Payments() {
  const { data: payments, isLoading } = usePayments();

  if (isLoading) return <PageLoader label="Loading payments…" />;

  const list = [...(payments ?? [])].sort(
    (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
  );
  const totalPaid = list.reduce((sum, p) => sum + p.amountPaid, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Payments</h1>
          <p className="text-sm text-slate-500">Your payment history.</p>
        </div>
        <ButtonLink to="/payments/new">
          <Plus className="h-4 w-4" />
          Make Payment
        </ButtonLink>
      </div>

      {list.length > 0 && (
        <Card>
          <CardBody className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Total paid</span>
            <span className="text-xl font-bold text-emerald-600">{formatCurrency(totalPaid)}</span>
          </CardBody>
        </Card>
      )}

      {list.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payments yet"
          description="Your payments will appear here once recorded."
          action={<ButtonLink to="/payments/new">Make a payment</ButtonLink>}
        />
      ) : (
        <div className="space-y-3">
          {list.map((payment) => (
            <Card key={payment.paymentId}>
              <CardBody className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(payment.amountPaid)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDate(payment.paymentDate)}
                      {payment.orderId ? ` · Order #${payment.orderId}` : ''}
                    </p>
                  </div>
                </div>
                <Badge tone="info">{humanize(payment.paymentMode)}</Badge>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
