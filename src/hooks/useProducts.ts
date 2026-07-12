import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/api/products';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll,
    staleTime: 5 * 60_000,
  });
}
