'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getOrderStatusClass } from '@/lib/mock-db';
import { apiGetById, apiGet } from '@/lib/api';
import { OrderDraft, OrderDraftLine } from '@/lib/types';

const STEPS = ['Submitted', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

function getStepIndex(status: string): number {
  const map: Record<string, number> = {
    Submitted: 0, Confirmed: 1, Processing: 2, Shipped: 3, Delivered: 4,
  };
  return map[status] ?? -1;
}

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = React.useState<OrderDraft | undefined>(undefined);
  const [lines, setLines] = React.useState<OrderDraftLine[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!id) return;
    Promise.all([
      apiGetById<OrderDraft>('ivg_orderdrafts', id),
      apiGet<OrderDraftLine>('ivg_orderdraftlines', `$filter=_ivg_orderdraft_value eq '${id}'`)
    ])
      .then(([fetchedOrder, fetchedLines]) => {
        setOrder(fetchedOrder);
        setLines(fetchedLines);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="portal-page" style={{ padding: 60, textAlign: 'center' }}>Loading...</div>;
  }

  if (!order) {
    return (
      <div className="portal-page" style={{ padding: 60, textAlign: 'center' }}>
        <h2>Order not found</h2>
        <Link href="/my-orders" className="ivg-btn ivg-btn--secondary" style={{ marginTop: 24 }}>Back to Orders</Link>
      </div>
    );
  }

  const stepIdx = getStepIndex(order.ivg_status);
  const isCancelled = order.ivg_status === 'Cancelled';

  return (
    <div className="portal-page">
      <header className="page-header">
        <div>
          <Link href="/my-orders" className="back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            Back to Orders
          </Link>
          <h1>Order {order.ivg_orderdraftnumber}</h1>
          <p className="text-secondary">
            Placed on {new Date(order.ivg_orderdate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            {order.ivg_ponumber && <> &middot; PO: {order.ivg_ponumber}</>}
          </p>
        </div>
        <span className={`status-pill status-pill--${getOrderStatusClass(order.ivg_status)} status-pill--lg`}>
          {order.ivg_status}
        </span>
      </header>

      {/* Status Stepper */}
      {!isCancelled && (
        <div className="order-stepper">
          {STEPS.map((step, i) => (
            <div key={step} className={`stepper-step${i <= stepIdx ? ' stepper-step--done' : ''}${i === stepIdx ? ' stepper-step--current' : ''}`}>
              <div className="stepper-dot">
                {i < stepIdx ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span className="stepper-label">{step}</span>
              {i < STEPS.length - 1 && <div className={`stepper-line${i < stepIdx ? ' stepper-line--done' : ''}`} />}
            </div>
          ))}
        </div>
      )}

      {isCancelled && (
        <div className="cancel-notice">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
          <span>This order was cancelled. {order.ivg_customernotes}</span>
        </div>
      )}

      {/* Order Lines */}
      <div className="table-card" style={{ marginTop: 32 }}>
        <h3 className="table-card-title">Order Items</h3>
        {lines.length > 0 ? (
          <table className="portal-table">
            <thead>
              <tr>
                <th>Product</th>
                <th style={{ textAlign: 'right' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Unit Price</th>
                <th style={{ textAlign: 'right' }}>Net</th>
                <th style={{ textAlign: 'right' }}>VAT</th>
                <th style={{ textAlign: 'right' }}>Gross</th>
              </tr>
            </thead>
            <tbody>
              {lines.map(line => (
                <tr key={line.ivg_orderdraftlineid}>
                  <td><strong>{line.ivg_productname}</strong></td>
                  <td style={{ textAlign: 'right' }}>{line.ivg_quantity}</td>
                  <td style={{ textAlign: 'right' }}>£{line.ivg_unitprice.toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>£{line.ivg_netamount.toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>£{line.ivg_vatamount.toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}><strong>£{line.ivg_grossamount.toFixed(2)}</strong></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}></td>
                <td style={{ textAlign: 'right' }}><strong>£{order.ivg_totalnetamount?.toFixed(2)}</strong></td>
                <td style={{ textAlign: 'right' }}><strong>£{order.ivg_vatamount?.toFixed(2)}</strong></td>
                <td style={{ textAlign: 'right' }}><strong className="text-gradient">£{order.ivg_totalgross?.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
        ) : (
          <p className="text-secondary" style={{ padding: 24 }}>No line items available for this order.</p>
        )}
      </div>

      {/* Delivery Info */}
      {order.ivg_deliverydate && (
        <div className="detail-card" style={{ marginTop: 24 }}>
          <h3 className="table-card-title">Delivery Information</h3>
          <div className="detail-grid">
            <div>
              <span className="detail-label">Estimated Delivery</span>
              <span className="detail-value">{new Date(order.ivg_deliverydate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div>
              <span className="detail-label">Delivery Address</span>
              <span className="detail-value">45 Warehouse Lane, Manchester, M1 2AB</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
