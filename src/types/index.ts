// =====================================================================
// Domain types — mirror the EMS API contracts.
// =====================================================================

export type ProductType = 'FINISHED' | 'SEMI_FINISHED' | 'RAW_MATERIAL';

export type OrderStatus = 'CREATED' | 'COMPLETED' | 'CANCELLED';

export type PaymentMode = 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE';

export interface Client {
  clientId: number;
  name: string;
  phoneNo?: string | null;
  emailId?: string | null;
  address?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  productId: number;
  productName: string;
  productType: ProductType;
  standardSize?: number | null;
  rate: number;
}

export interface OrderBook {
  serialNo: number;
  productId: number;
  productName?: string | null;
  quantity: number;
  quantityFulfilled: number;
  quantityForProduction: number;
  rate: number;
  lineTotal: number;
}

export interface Order {
  orderId: number;
  clientId?: number;
  client?: Client | null;
  date: string;
  totalAmount: number;
  paidAmount: number;
  status: OrderStatus;
  balanceDue?: number;
  orderBooks: OrderBook[];
}

export interface Payment {
  paymentId: number;
  clientId: number;
  orderId?: number | null;
  paymentDate: string;
  amountPaid: number;
  paymentMode: PaymentMode;
  remarks?: string | null;
}

export interface Receivable {
  receivableId: number;
  clientId: number;
  totalDue: number;
  aging0To30: number;
  aging31To60: number;
  aging61To90: number;
  agingOver90: number;
}

// -------------------- Request payloads --------------------

export interface CreateOrderLine {
  productId: number;
  quantity: number;
  rate: number;
}

export interface CreateOrderRequest {
  clientId: number;
  date: string; // ISO date (yyyy-MM-dd)
  /** Backend DTO field name for order line items. */
  items: CreateOrderLine[];
}

export interface CreatePaymentRequest {
  clientId: number;
  orderId?: number | null;
  paymentDate: string; // ISO date (yyyy-MM-dd)
  amountPaid: number;
  paymentMode: PaymentMode;
  remarks?: string | null;
}

// -------------------- API error shape --------------------

export interface ApiError {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
}
