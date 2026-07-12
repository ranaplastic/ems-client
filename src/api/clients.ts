import { api } from './client';
import type { Client } from '@/types';

export const clientsApi = {
  getById: (id: number) => api.get<Client>(`/clients/${id}`).then((r) => r.data),

  getAll: () => api.get<Client[]>('/clients').then((r) => r.data),

  update: (id: number, payload: Partial<Client>) =>
    api.put<Client>(`/clients/${id}`, payload).then((r) => r.data),
};
