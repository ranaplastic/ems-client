import { api } from './client';
import type { CreatePaymentRequest, Payment } from '@/types';

export const paymentsApi = {
  create: (payload: CreatePaymentRequest) =>
    api.post<Payment>('/payments', payload).then((r) => r.data),

  getByClient: (clientId: number) =>
    api.get<Payment[]>(`/payments/client/${clientId}`).then((r) => r.data),

  getByOrder: (orderId: number) =>
    api.get<Payment[]>(`/payments/order/${orderId}`).then((r) => r.data),
};
