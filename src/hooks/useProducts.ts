'use client';
import useSWR from 'swr';
import { apiGet } from '@/lib/api';
import { Product } from '@/lib/types';

export function useProducts() {
  const { data, error, isLoading } = useSWR(
    'products',
    () => apiGet<Product>(
      'products',
      `$filter=statecode eq 0 and ivg_portalvisible eq true` +
      `&$orderby=ivg_productline asc,name asc&$top=500` +
      `&$select=productid,name,productnumber,ivg_productline,ivg_flavour,ivg_nicstrength,price,ivg_vatrate`
    ),
    { revalidateOnFocus: false } // products don't change often
  );

  // Group by product line client-side
  const grouped = (data ?? []).reduce<Record<string, Product[]>>((acc, p) => {
    const line = p.ivg_productline ?? 'Other';
    if (!acc[line]) acc[line] = [];
    acc[line].push(p);
    return acc;
  }, {});

  return { products: data ?? [], grouped, loading: isLoading, error };
}
