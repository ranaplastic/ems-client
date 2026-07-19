import { api } from './client';
import type { CreateOrderRequest, Order, OrderBook } from '@/types';

/**
 * The backend may return order line items under several keys depending on the
 * endpoint / DTO version (`orderBooks`, `items`, or `orderItems`). Normalise
 * them all to `orderBooks` so the UI can rely on a single shape.
 */
function normaliseOrder(raw: Order & { items?: OrderBook[]; orderItems?: OrderBook[] }): Order {
  const lines = raw.orderBooks ?? raw.items ?? raw.orderItems ?? [];
  return { ...raw, orderBooks: lines };
}

const normaliseMany = (rows: Order[]) => rows.map(normaliseOrder);

export const ordersApi = {
  create: (payload: CreateOrderRequest) =>
    api.post<Order>('/orders', payload).then((r) => normaliseOrder(r.data)),

  getById: (id: number) =>
    api.get<Order>(`/orders/${id}`).then((r) => normaliseOrder(r.data)),

  getByClient: (clientId: number) =>
    api.get<Order[]>(`/orders/client/${clientId}`).then((r) => normaliseMany(r.data)),

  cancel: (id: number) =>
    api.post<Order>(`/orders/${id}/cancel`).then((r) => normaliseOrder(r.data)),

  /**
   * Download the invoice PDF for an order. Backend exposes
   * `GET /orders/{id}/pdf` returning `application/pdf`.
   */
  downloadInvoice: (id: number) =>
    api
      .get<Blob>(`/orders/${id}/pdf`, {
        responseType: 'blob',
        headers: { Accept: 'application/pdf' },
      })
      .then((r) => r.data),
};
