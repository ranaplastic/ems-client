import { Badge } from '@/components/ui/Badge';
import { humanize } from '@/lib/format';
import type { OrderStatus } from '@/types';

const toneByStatus: Record<OrderStatus, 'info' | 'success' | 'danger'> = {
  CREATED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={toneByStatus[status] ?? 'neutral'}>{humanize(status)}</Badge>;
}
