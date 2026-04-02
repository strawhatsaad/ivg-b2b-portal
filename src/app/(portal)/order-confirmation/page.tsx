'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiGetById, apiGet } from '@/lib/api';
import { OrderDraft, OrderDraftLine } from '@/lib/types';
import { useEffect, useState } from 'react';

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') || '';
  const [order, setOrder] = useState<OrderDraft | undefined>(undefined);
  const [lines, setLines] = useState<OrderDraftLine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    Promise.all([
      apiGetById<OrderDraft>('ivg_orderdrafts', orderId),
      apiGet<OrderDraftLine>('ivg_orderdraftlines', `$filter=_ivg_orderdraft_value eq '${orderId}'`)
    ])
      .then(([fetchedOrder, fetchedLines]) => {
        setOrder(fetchedOrder);
        setLines(fetchedLines);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <div className="portal-page" style={{ padding: 60, textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="portal-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="confirmation-card">
        <div className="confirmation-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--ivg-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h1>Order Submitted!</h1>
        <p className="text-secondary">Your order has been placed and is being processed by the IVG team.</p>
        <div className="confirmation-details">
          <div className="confirmation-row">
            <span>Order Number</span>
            <strong>{order?.ivg_orderdraftnumber || '—'}</strong>
          </div>
          <div className="confirmation-row">
            <span>Status</span>
            <strong><span className="status-pill status-pill--submitted">{order?.ivg_status || 'Submitted'}</span></strong>
          </div>
          <div className="confirmation-row">
            <span>Items</span>
            <strong>{lines.length} product{lines.length !== 1 ? 's' : ''}</strong>
          </div>
          <div className="confirmation-row">
            <span>Net Amount</span>
            <strong>£{order?.ivg_totalnetamount?.toFixed(2) || '0.00'}</strong>
          </div>
          <div className="confirmation-row">
            <span>VAT</span>
            <strong>£{order?.ivg_vatamount?.toFixed(2) || '0.00'}</strong>
          </div>
          <div className="confirmation-row">
            <span>Total</span>
            <strong>£{order?.ivg_totalgross?.toFixed(2) || '0.00'}</strong>
          </div>
          {order?.ivg_ponumber && (
            <div className="confirmation-row">
              <span>PO Number</span>
              <strong>{order.ivg_ponumber}</strong>
            </div>
          )}
          <div className="confirmation-row">
            <span>Estimated Delivery</span>
            <strong>3–5 Business Days</strong>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          <Link href="/my-orders" className="ivg-btn ivg-btn--primary">View My Orders</Link>
          <Link href="/dashboard" className="ivg-btn ivg-btn--secondary">Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
