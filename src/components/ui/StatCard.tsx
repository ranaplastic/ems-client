import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'brand',
  className,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: 'brand' | 'emerald' | 'amber' | 'red';
  className?: string;
}) {
  const tones = {
    brand: 'bg-brand-50 text-brand-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  } as const;

  return (
    <div className={cn('rounded-2xl border border-slate-200 bg-white p-4 shadow-sm', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span className={cn('rounded-lg p-2', tones[tone])}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">{value}</p>
    </div>
  );
}
