'use client';
import useSWR from 'swr';
import { apiGet } from '@/lib/api';
import { Incident } from '@/lib/types';
import { useAuth } from './useAuth';

export function useTickets() {
  const { user } = useAuth();
  // Assume B2B support tickets map to the user's account ID
  const accountId = user?.accountId;

  const { data, error, isLoading, mutate } = useSWR(
    accountId ? ['tickets', accountId] : null,
    () => apiGet<Incident>(
      'incidents',
      `$filter=_customerid_value eq '${accountId}'` +
      `&$orderby=createdon desc&$top=50` +
      `&$select=incidentid,ticketnumber,title,statuscode,statecode,createdon,description,casetypecode`
    )
  );

  return { tickets: data ?? [], loading: isLoading, error, refresh: mutate };
}
