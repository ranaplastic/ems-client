import { api } from './client';
import type { Product, ProductType } from '@/types';

export const productsApi = {
  getAll: () => api.get<Product[]>('/products').then((r) => r.data),

  getById: (id: number) => api.get<Product>(`/products/${id}`).then((r) => r.data),

  getByType: (type: ProductType) =>
    api.get<Product[]>(`/products/type/${type}`).then((r) => r.data),

  search: (name: string) =>
    api
      .get<Product[]>('/products/search', { params: { name } })
      .then((r) => r.data),
};
