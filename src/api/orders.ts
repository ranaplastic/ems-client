import { api } from './client';
import type { CreateOrderRequest, Order } from '@/types';

export const ordersApi = {
  create: (payload: CreateOrderRequest) =>
    api.post<Order>('/orders', payload).then((r) => r.data),

  getById: (id: number) => api.get<Order>(`/orders/${id}`).then((r) => r.data),

  getByClient: (clientId: number) =>
    api.get<Order[]>(`/orders/client/${clientId}`).then((r) => r.data),

  cancel: (id: number) => api.post<Order>(`/orders/${id}/cancel`).then((r) => r.data),
};
