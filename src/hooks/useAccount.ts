'use client';
import useSWR from 'swr';
import { apiGetById } from '@/lib/api';
import { useAuth } from './useAuth';

export interface ContactAccount {
  contactid: string;
  fullname?: string;
  firstname?: string;
  lastname?: string;
  emailaddress1?: string;
  telephone1?: string;
  creditlimit?: number;
  paymenttermscode?: number;
  _parentcustomerid_value?: string;
  ['_parentcustomerid_value@OData.Community.Display.V1.FormattedValue']?: string;
  ['paymenttermscode@OData.Community.Display.V1.FormattedValue']?: string;
}

export function useAccount() {
  const { user } = useAuth();
  const accountId = user?.accountId;

  const { data, error, isLoading, mutate } = useSWR(
    accountId ? ['account', accountId] : null,
    () => apiGetById<Account>(
      'accounts',
      accountId!,
      `accountid,name,ivg_customertier,ivg_creditlimit,ivg_creditavailable,ivg_customertype`
    )
  );

  return { account: data ?? null, loading: isLoading, error, refresh: mutate };
}
