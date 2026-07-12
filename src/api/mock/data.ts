import type { Client, Order, Payment, Product, Receivable } from '@/types';

// =====================================================================
// In-memory demo dataset. Mutated during the session so create/cancel/pay
// flows behave realistically. Reset on page refresh.
// =====================================================================

export const mockClients: Client[] = [
  {
    clientId: 1001,
    name: 'Acme Traders',
    phoneNo: '9876543210',
    emailId: 'purchasing@acmetraders.example',
    address: '14 Industrial Estate, Ahmedabad, Gujarat',
    createdAt: '2025-01-12T09:30:00',
    updatedAt: '2026-05-02T11:00:00',
  },
  {
    clientId: 1002,
    name: 'Blue Ocean Distributors',
    phoneNo: '9812345678',
    emailId: 'orders@blueocean.example',
    address: 'Plot 22, MIDC, Pune, Maharashtra',
    createdAt: '2025-03-20T14:15:00',
    updatedAt: '2026-04-18T10:20:00',
  },
];

export const mockProducts: Product[] = [
  { productId: 1, productName: 'Plastic Chair — Standard', productType: 'FINISHED', standardSize: 45, rate: 350.0 },
  { productId: 2, productName: 'Plastic Chair — Premium', productType: 'FINISHED', standardSize: 48, rate: 520.0 },
  { productId: 3, productName: 'Storage Crate 20L', productType: 'FINISHED', standardSize: 20, rate: 275.5 },
  { productId: 4, productName: 'Storage Crate 50L', productType: 'FINISHED', standardSize: 50, rate: 610.0 },
  { productId: 5, productName: 'Water Tank 500L', productType: 'FINISHED', standardSize: 500, rate: 4200.0 },
  { productId: 6, productName: 'Bucket 15L', productType: 'FINISHED', standardSize: 15, rate: 95.0 },
  { productId: 7, productName: 'Chair Leg Assembly', productType: 'SEMI_FINISHED', standardSize: 40, rate: 60.0 },
  { productId: 8, productName: 'Tank Lid Blank', productType: 'SEMI_FINISHED', standardSize: 60, rate: 120.0 },
  { productId: 9, productName: 'HDPE Granules', productType: 'RAW_MATERIAL', standardSize: null, rate: 85.0 },
  { productId: 10, productName: 'PP Granules', productType: 'RAW_MATERIAL', standardSize: null, rate: 92.0 },
  { productId: 11, productName: 'Color Masterbatch — Blue', productType: 'RAW_MATERIAL', standardSize: null, rate: 210.0 },
];

export const mockOrders: Order[] = [
  {
    orderId: 5001,
    clientId: 1001,
    date: '2026-06-15',
    totalAmount: 7000.0,
    paidAmount: 7000.0,
    status: 'COMPLETED',
    orderBooks: [
      {
        serialNo: 1,
        productId: 1,
        productName: 'Plastic Chair — Standard',
        quantity: 20,
        quantityFulfilled: 20,
        quantityForProduction: 0,
        rate: 350.0,
        lineTotal: 7000.0,
      },
    ],
  },
  {
    orderId: 5002,
    clientId: 1001,
    date: '2026-06-28',
    totalAmount: 13050.0,
    paidAmount: 5000.0,
    status: 'CREATED',
    orderBooks: [
      {
        serialNo: 2,
        productId: 4,
        productName: 'Storage Crate 50L',
        quantity: 15,
        quantityFulfilled: 10,
        quantityForProduction: 5,
        rate: 610.0,
        lineTotal: 9150.0,
      },
      {
        serialNo: 3,
        productId: 6,
        productName: 'Bucket 15L',
        quantity: 41,
        quantityFulfilled: 41,
        quantityForProduction: 0,
        rate: 95.0,
        lineTotal: 3895.0,
      },
    ],
  },
  {
    orderId: 5003,
    clientId: 1001,
    date: '2026-07-05',
    totalAmount: 8400.0,
    paidAmount: 0.0,
    status: 'CREATED',
    orderBooks: [
      {
        serialNo: 4,
        productId: 5,
        productName: 'Water Tank 500L',
        quantity: 2,
        quantityFulfilled: 0,
        quantityForProduction: 2,
        rate: 4200.0,
        lineTotal: 8400.0,
      },
    ],
  },
  {
    orderId: 5004,
    clientId: 1002,
    date: '2026-07-01',
    totalAmount: 2750.0,
    paidAmount: 2750.0,
    status: 'COMPLETED',
    orderBooks: [
      {
        serialNo: 5,
        productId: 3,
        productName: 'Storage Crate 20L',
        quantity: 10,
        quantityFulfilled: 10,
        quantityForProduction: 0,
        rate: 275.5,
        lineTotal: 2755.0,
      },
    ],
  },
];

export const mockPayments: Payment[] = [
  {
    paymentId: 9001,
    clientId: 1001,
    orderId: 5001,
    paymentDate: '2026-06-16',
    amountPaid: 7000.0,
    paymentMode: 'BANK_TRANSFER',
    remarks: 'Full settlement — Order 5001',
  },
  {
    paymentId: 9002,
    clientId: 1001,
    orderId: 5002,
    paymentDate: '2026-06-29',
    amountPaid: 5000.0,
    paymentMode: 'UPI',
    remarks: 'Advance payment',
  },
  {
    paymentId: 9003,
    clientId: 1002,
    orderId: 5004,
    paymentDate: '2026-07-02',
    amountPaid: 2750.0,
    paymentMode: 'CASH',
    remarks: null,
  },
];

export const mockReceivables: Receivable[] = [
  {
    receivableId: 7001,
    clientId: 1001,
    totalDue: 16450.0,
    aging0To30: 8400.0,
    aging31To60: 8050.0,
    aging61To90: 0.0,
    agingOver90: 0.0,
  },
  {
    receivableId: 7002,
    clientId: 1002,
    totalDue: 0.0,
    aging0To30: 0.0,
    aging31To60: 0.0,
    aging61To90: 0.0,
    agingOver90: 0.0,
  },
];

// Auto-increment counters for newly created records this session.
export const counters = {
  orderId: 5100,
  serialNo: 100,
  paymentId: 9100,
  receivableId: 7100,
};
