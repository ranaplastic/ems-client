import { api } from './client';
import type { Receivable } from '@/types';

export const receivablesApi = {
  getByClient: (clientId: number) =>
    api.get<Receivable>(`/receivables/client/${clientId}`).then((r) => r.data),
};
