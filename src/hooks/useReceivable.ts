import { useQuery } from '@tanstack/react-query';
import { receivablesApi } from '@/api/receivables';
import { useAuthStore } from '@/store/authStore';

export function useReceivable() {
  const clientId = useAuthStore((s) => s.client?.clientId);
  return useQuery({
    queryKey: ['receivable', clientId],
    queryFn: () => receivablesApi.getByClient(clientId as number),
    enabled: !!clientId,
    // A client may not have a receivable yet — treat 404 as "no balance".
    retry: false,
  });
}
