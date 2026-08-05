import { useQuery } from '@tanstack/react-query';
import * as adminApi from '@/lib/admin-api';
import { queryKeys } from './query-keys';

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: adminApi.buscarDashboard,
  });
}
