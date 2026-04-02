'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MOCK_ANALYTICS, getOrderStatusClass } from '@/lib/mock-db';
import { getOrders } from '@/lib/mock-store';

const STATUSES = ['All', 'Shipped', 'Processing', 'Delivered', 'Cancelled', 'Submitted'];

export default function MyOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('All');
  const allOrders = getOrders();

  const filtered = statusFilter === 'All'
    ? allOrders
    : allOrders.filter(o => o.ivg_status === statusFilter);

  return (
    <div className="portal-page">
      <header className="page-header">
        <div>
          <h1>Order History</h1>
          <p className="text-secondary">Manage and monitor your wholesale procurement</p>
        </div>
        <Link href="/place-order" className="ivg-btn ivg-btn--primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          New Bulk Order
        </Link>
      </header>

      {/* Stats Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-label">Total Orders</span>
          <span className="stat-value">{allOrders.length}</span>
          <span className="stat-change stat-change--up">+10% vs LW</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending Approval</span>
          <span className="stat-value">{MOCK_ANALYTICS.pendingApproval}</span>
          <span className="stat-sub">Action Required</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Shipped Today</span>
          <span className="stat-value">{MOCK_ANALYTICS.shippedToday}</span>
          <span className="stat-sub">Real-time</span>
        </div>
        <div className="stat-card stat-card--highlight">
          <span className="stat-label">Total Spend</span>
          <span className="stat-value">£{(MOCK_ANALYTICS.totalSpend / 1000).toFixed(1)}K</span>
          <span className="stat-sub">This Quarter</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="filter-pills">
          {STATUSES.map(s => (
            <button
              key={s}
              className={`filter-pill${statusFilter === s ? ' filter-pill--active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="table-card">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>PO Number</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Total Amount</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(order => (
              <tr key={order.ivg_orderdraftid}>
                <td>
                  <Link href={`/my-orders/${order.ivg_orderdraftid}`} className="order-link">
                    <strong>{order.ivg_orderdraftnumber}</strong>
                  </Link>
                </td>
                <td className="text-secondary">
                  {new Date(order.ivg_orderdate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="text-secondary">{order.ivg_ponumber || '—'}</td>
                <td>
                  <span className={`status-pill status-pill--${getOrderStatusClass(order.ivg_status)}`}>
                    {order.ivg_status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <strong>£{order.ivg_totalgross?.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</strong>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <Link href={`/my-orders/${order.ivg_orderdraftid}`} className="ivg-btn--tertiary" style={{ fontSize: 13 }}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
