'use client';
import useSWR from 'swr';
import { apiGet, apiGetById } from '@/lib/api';
import { OrderDraft } from '@/lib/types';
import { useAuth } from './useAuth';

export function useOrders() {
  const { user } = useAuth();
  const accountId = user?.accountId;

  const { data, error, isLoading, mutate } = useSWR(
    accountId ? ['orders', accountId] : null,
    () => apiGet<OrderDraft>(
      'ivg_orderdrafts',
      `$filter=_ivg_account_value eq '${accountId}'` +
      `&$orderby=ivg_orderdate desc&$top=50` +
      `&$select=ivg_orderdraftid,ivg_orderdraftnumber,ivg_orderdate,ivg_status,ivg_totalgross,ivg_ponumber`
    )
  );

  return { orders: data ?? [], loading: isLoading, error, refresh: mutate };
}

export function useOrder(id: string | null) {
  const { data, error, isLoading } = useSWR(
    id ? ['order', id] : null,
    () => apiGetById<OrderDraft>('ivg_orderdrafts', id!)
  );
  return { order: data, loading: isLoading, error };
}
