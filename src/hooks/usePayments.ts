import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '@/api/payments';
import type { CreatePaymentRequest } from '@/types';
import { useAuthStore } from '@/store/authStore';

export function usePayments() {
  const clientId = useAuthStore((s) => s.client?.clientId);
  return useQuery({
    queryKey: ['payments', clientId],
    queryFn: () => paymentsApi.getByClient(clientId as number),
    enabled: !!clientId,
  });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  const clientId = useAuthStore((s) => s.client?.clientId);
  return useMutation({
    mutationFn: (payload: CreatePaymentRequest) => paymentsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments', clientId] });
      qc.invalidateQueries({ queryKey: ['receivable', clientId] });
      qc.invalidateQueries({ queryKey: ['orders', clientId] });
    },
  });
}
