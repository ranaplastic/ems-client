import { Wallet, CheckCircle2 } from 'lucide-react';
import { useReceivable } from '@/hooks/useReceivable';
import { useOrders } from '@/hooks/useOrders';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/cn';

export default function Receivables() {
  const { data: receivable, isLoading, isError } = useReceivable();
  const { data: orders, isLoading: ordersLoading } = useOrders();

  if (isLoading || ordersLoading) return <PageLoader label="Loading balance…" />;

  // Sum unpaid balance across every non-cancelled order — this catches CREATED
  // orders that the server-side receivable record doesn't include yet.
  const openBalance = (orders ?? [])
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + Math.max(0, (o.totalAmount ?? 0) - (o.paidAmount ?? 0)), 0);

  // A 404 (no receivable record) simply means the client owes nothing on
  // completed orders — but they may still have unpaid open orders.
  const receivableDue = receivable?.totalDue ?? 0;
  const totalDue = Math.max(receivableDue, openBalance);

  if ((isError && openBalance <= 0) || totalDue <= 0) {
    return (
      <div className="space-y-5">
        <Header />
        <EmptyState
          icon={CheckCircle2}
          title="You're all settled up"
          description="You have no outstanding balance. Thank you!"
        />
      </div>
    );
  }

  const buckets = receivable
    ? [
        { label: '0–30 days', value: receivable.aging0To30, tone: 'emerald' as const },
        { label: '31–60 days', value: receivable.aging31To60, tone: 'amber' as const },
        { label: '61–90 days', value: receivable.aging61To90, tone: 'orange' as const },
        { label: 'Over 90 days', value: receivable.agingOver90, tone: 'red' as const },
      ]
    : [];

  const toneClass = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
  };

  return (
    <div className="space-y-5">
      <Header />

      <Card>
        <CardBody className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Wallet className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm text-slate-500">Total Outstanding</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{formatCurrency(totalDue)}</p>
          {openBalance > receivableDue && (
            <p className="mt-2 text-xs text-slate-400">
              Includes {formatCurrency(openBalance - receivableDue)} from open orders yet to be
              invoiced.
            </p>
          )}
        </CardBody>
      </Card>

      {buckets.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900">Aging Breakdown</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {buckets.map((b) => {
              const pct = receivableDue > 0 ? (b.value / receivableDue) * 100 : 0;
              return (
                <div key={b.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-slate-600">{b.label}</span>
                    <span className="font-medium text-slate-900">{formatCurrency(b.value)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn('h-full rounded-full transition-all', toneClass[b.tone])}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function Header() {
  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Outstanding Balance</h1>
      <p className="text-sm text-slate-500">Your account balance and payment aging.</p>
    </div>
  );
}
