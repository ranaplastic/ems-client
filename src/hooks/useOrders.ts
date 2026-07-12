import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/api/orders';
import type { CreateOrderRequest } from '@/types';
import { useAuthStore } from '@/store/authStore';

export function useOrders() {
  const clientId = useAuthStore((s) => s.client?.clientId);
  return useQuery({
    queryKey: ['orders', clientId],
    queryFn: () => ordersApi.getByClient(clientId as number),
    enabled: !!clientId,
  });
}

export function useOrder(orderId: number | undefined) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.getById(orderId as number),
    enabled: !!orderId,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  const clientId = useAuthStore((s) => s.client?.clientId);
  return useMutation({
    mutationFn: (payload: CreateOrderRequest) => ordersApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders', clientId] });
      qc.invalidateQueries({ queryKey: ['receivable', clientId] });
    },
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  const clientId = useAuthStore((s) => s.client?.clientId);
  return useMutation({
    mutationFn: (orderId: number) => ordersApi.cancel(orderId),
    onSuccess: (_data, orderId) => {
      qc.invalidateQueries({ queryKey: ['orders', clientId] });
      qc.invalidateQueries({ queryKey: ['order', orderId] });
    },
  });
}
