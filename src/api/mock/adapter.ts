import { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import type {
  Client,
  CreateOrderRequest,
  CreatePaymentRequest,
  Order,
  Payment,
  ProductType,
} from '@/types';
import {
  counters,
  mockClients,
  mockOrders,
  mockPayments,
  mockProducts,
  mockReceivables,
} from './data';

const LATENCY_MS = 350;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
}

function ok<T>(data: T, config: InternalAxiosRequestConfig, status = 200): Promise<AxiosResponse<T>> {
  return delay({
    data,
    status,
    statusText: 'OK',
    headers: {},
    config,
  } as AxiosResponse<T>);
}

function fail(status: number, message: string, config: InternalAxiosRequestConfig): Promise<never> {
  const response: AxiosResponse = {
    data: { status, error: 'Mock Error', message, path: config.url },
    status,
    statusText: 'ERROR',
    headers: {},
    config,
  };
  const error = new AxiosError(message, String(status), config, undefined, response);
  return new Promise((_resolve, reject) => setTimeout(() => reject(error), LATENCY_MS));
}

function parseBody<T>(config: InternalAxiosRequestConfig): T {
  if (!config.data) return {} as T;
  return typeof config.data === 'string' ? (JSON.parse(config.data) as T) : (config.data as T);
}

function ensureReceivable(clientId: number) {
  let receivable = mockReceivables.find((r) => r.clientId === clientId);
  if (!receivable) {
    receivable = {
      receivableId: ++counters.receivableId,
      clientId,
      totalDue: 0,
      aging0To30: 0,
      aging31To60: 0,
      aging61To90: 0,
      agingOver90: 0,
    };
    mockReceivables.push(receivable);
  }
  return receivable;
}

/**
 * Custom Axios adapter that serves the in-memory demo dataset.
 * Installed on the shared `api` instance when VITE_USE_MOCK=true.
 */
export const mockAdapter: AxiosAdapter = (config) => {
  const method = (config.method ?? 'get').toLowerCase();
  const url = (config.url ?? '').split('?')[0];
  const params = config.params ?? {};

  // ---------------- Clients ----------------
  if (url === '/clients' && method === 'get') return ok(mockClients, config);

  const clientById = url.match(/^\/clients\/(\d+)$/);
  if (clientById) {
    const id = Number(clientById[1]);
    const client = mockClients.find((c) => c.clientId === id);
    if (!client) return fail(404, `Client ${id} not found`, config);

    if (method === 'get') return ok(client, config);
    if (method === 'put') {
      const patch = parseBody<Partial<Client>>(config);
      Object.assign(client, patch, { updatedAt: new Date().toISOString() });
      return ok(client, config);
    }
  }

  // ---------------- Products ----------------
  if (url === '/products' && method === 'get') return ok(mockProducts, config);
  if (url === '/products/search' && method === 'get') {
    const name = String(params.name ?? '').toLowerCase();
    return ok(
      mockProducts.filter((p) => p.productName.toLowerCase().includes(name)),
      config,
    );
  }
  const productByType = url.match(/^\/products\/type\/(\w+)$/);
  if (productByType && method === 'get') {
    const type = productByType[1] as ProductType;
    return ok(
      mockProducts.filter((p) => p.productType === type),
      config,
    );
  }
  const productById = url.match(/^\/products\/(\d+)$/);
  if (productById && method === 'get') {
    const product = mockProducts.find((p) => p.productId === Number(productById[1]));
    return product ? ok(product, config) : fail(404, 'Product not found', config);
  }

  // ---------------- Orders ----------------
  if (url === '/orders' && method === 'post') {
    const body = parseBody<CreateOrderRequest>(config);
    const order: Order = {
      orderId: ++counters.orderId,
      clientId: body.clientId,
      date: body.date,
      status: 'CREATED',
      paidAmount: 0,
      totalAmount: 0,
      orderBooks: body.items.map((line) => {
        const product = mockProducts.find((p) => p.productId === line.productId);
        const lineTotal = Number((line.quantity * line.rate).toFixed(2));
        return {
          serialNo: ++counters.serialNo,
          productId: line.productId,
          productName: product?.productName ?? `Product #${line.productId}`,
          quantity: line.quantity,
          quantityFulfilled: line.quantity,
          quantityForProduction: 0,
          rate: line.rate,
          lineTotal,
        };
      }),
    };
    order.totalAmount = Number(
      order.orderBooks.reduce((sum, l) => sum + l.lineTotal, 0).toFixed(2),
    );
    mockOrders.push(order);
    return ok(order, config, 201);
  }

  const orderByClient = url.match(/^\/orders\/client\/(\d+)$/);
  if (orderByClient && method === 'get') {
    const clientId = Number(orderByClient[1]);
    return ok(
      mockOrders.filter((o) => o.clientId === clientId),
      config,
    );
  }

  const orderCancel = url.match(/^\/orders\/(\d+)\/cancel$/);
  if (orderCancel && method === 'post') {
    const order = mockOrders.find((o) => o.orderId === Number(orderCancel[1]));
    if (!order) return fail(404, 'Order not found', config);
    if (order.status !== 'CREATED') return fail(409, 'Only open orders can be cancelled', config);
    order.status = 'CANCELLED';
    return ok(order, config);
  }

  const orderInvoice = url.match(/^\/orders\/(\d+)\/pdf$/);
  if (orderInvoice && method === 'get') {
    const order = mockOrders.find((o) => o.orderId === Number(orderInvoice[1]));
    if (!order) return fail(404, 'Order not found', config);
    // Return a minimal placeholder PDF blob for demo mode.
    const pdfBytes = new Uint8Array([
      0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, // %PDF-1.4\n
    ]);
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    return ok(blob as unknown as Order, config);
  }

  const orderById = url.match(/^\/orders\/(\d+)$/);
  if (orderById && method === 'get') {
    const order = mockOrders.find((o) => o.orderId === Number(orderById[1]));
    return order ? ok(order, config) : fail(404, 'Order not found', config);
  }

  // ---------------- Payments ----------------
  if (url === '/payments' && method === 'post') {
    const body = parseBody<CreatePaymentRequest>(config);
    const receivable = ensureReceivable(body.clientId);

    if (!(body.amountPaid > 0)) return fail(400, 'Amount must be greater than zero', config);
    if (receivable.totalDue > 0 && body.amountPaid > receivable.totalDue) {
      return fail(409, 'Payment exceeds outstanding receivable', config);
    }

    const payment: Payment = {
      paymentId: ++counters.paymentId,
      clientId: body.clientId,
      orderId: body.orderId ?? null,
      paymentDate: body.paymentDate,
      amountPaid: body.amountPaid,
      paymentMode: body.paymentMode,
      remarks: body.remarks ?? null,
    };
    mockPayments.push(payment);

    // Reduce receivable, oldest buckets first.
    let remaining = body.amountPaid;
    for (const key of ['agingOver90', 'aging61To90', 'aging31To60', 'aging0To30'] as const) {
      const take = Math.min(receivable[key], remaining);
      receivable[key] = Number((receivable[key] - take).toFixed(2));
      remaining = Number((remaining - take).toFixed(2));
    }
    receivable.totalDue = Number(Math.max(0, receivable.totalDue - body.amountPaid).toFixed(2));

    // Reflect payment on the linked order.
    if (body.orderId) {
      const order = mockOrders.find((o) => o.orderId === body.orderId);
      if (order) {
        order.paidAmount = Number(
          Math.min(order.totalAmount, order.paidAmount + body.amountPaid).toFixed(2),
        );
      }
    }
    return ok(payment, config, 201);
  }

  const paymentByClient = url.match(/^\/payments\/client\/(\d+)$/);
  if (paymentByClient && method === 'get') {
    const clientId = Number(paymentByClient[1]);
    return ok(
      mockPayments.filter((p) => p.clientId === clientId),
      config,
    );
  }

  const paymentByOrder = url.match(/^\/payments\/order\/(\d+)$/);
  if (paymentByOrder && method === 'get') {
    const orderId = Number(paymentByOrder[1]);
    return ok(
      mockPayments.filter((p) => p.orderId === orderId),
      config,
    );
  }

  // ---------------- Receivables ----------------
  const receivableByClient = url.match(/^\/receivables\/client\/(\d+)$/);
  if (receivableByClient && method === 'get') {
    const clientId = Number(receivableByClient[1]);
    const receivable = mockReceivables.find((r) => r.clientId === clientId);
    return receivable ? ok(receivable, config) : fail(404, 'No receivable for client', config);
  }

  return fail(404, `Mock adapter has no handler for ${method.toUpperCase()} ${url}`, config);
};
