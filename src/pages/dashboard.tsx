'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { MOCK_CREDIT, MOCK_ANALYTICS, getOrderStatusClass, getTicketStatusLabel, getTicketStatusClass } from '@/lib/mock-db';
import { getOrders, getTickets } from '@/lib/mock-store';

export default function DashboardPage() {
  const { user } = useAuth();
  const displayName = user?.firstName || user?.userName || 'Partner';
  const allOrders = getOrders();
  const allTickets = getTickets();
  const recentOrders = allOrders.slice(0, 3);
  const openTickets = allTickets.filter(t => t.statecode === 0).slice(0, 2);

  return (
    <div className="portal-page">
      {/* Welcome Section */}
      <header className="dash-welcome">
        <div className="dash-welcome-text">
          <span className="dash-badge">Verified Partner</span>
          <h1>Welcome back, <span className="text-gradient">{displayName}</span></h1>
          <p>Your business portal is updated with the latest logistics data. Manage your inventory and wholesale requests below.</p>
        </div>
        <div className="dash-welcome-actions">
          <button className="ivg-btn ivg-btn--secondary">Download Reports</button>
        </div>
      </header>

      {/* Dashboard Grid */}
      <div className="dash-grid">
        {/* Hero Bulk Order Card */}
        <section className="dash-card dash-card--hero">
          <div className="hero-card-inner">
            <div className="hero-card-content">
              <span className="hero-card-meta">Inventory Management</span>
              <h2>New Bulk Order</h2>
              <p>Access wholesale pricing and priority shipping for bulk inventory restocking across all regions.</p>
              <Link href="/place-order" className="ivg-btn ivg-btn--primary hero-card-btn">
                Start Order
              </Link>
            </div>
          </div>
        </section>

        {/* Credit Account */}
        <section className="dash-card dash-card--credit">
          <div className="credit-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--ivg-primary)"><path d="M21 7.28V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-2.28c.59-.34 1-.98 1-1.72V9c0-.74-.41-1.38-1-1.72zM20 9v6h-4V9h4zM5 19V5h14v2h-6c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h6v2H5z"/></svg>
          </div>
          <span className="credit-label">Available Credit</span>
          <h3 className="credit-amount">£{MOCK_CREDIT.availableCredit.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</h3>
          <div className="credit-util">
            <div className="credit-util-row">
              <span>Utilization</span>
              <strong>{MOCK_CREDIT.utilization}%</strong>
            </div>
            <div className="credit-bar">
              <div className="credit-bar-fill" style={{ width: `${MOCK_CREDIT.utilization}%` }} />
            </div>
            <div className="credit-util-row">
              <span>Total Limit: <strong>£{MOCK_CREDIT.totalLimit.toLocaleString('en-GB')}</strong></span>
              <Link href="/credit-billing" className="credit-link">View History</Link>
            </div>
          </div>
        </section>

        {/* Onboarding Progress */}
        <section className="dash-card dash-card--onboard">
          <h3 className="dash-card-title">Onboarding Progress</h3>
          <ul className="onboard-list">
            <li className="onboard-item onboard-item--done">
              <div className="onboard-check">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <span>Business Verification</span>
            </li>
            <li className="onboard-item onboard-item--done">
              <div className="onboard-check">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <span>Tax Documentation</span>
            </li>
            <li className="onboard-item onboard-item--pending">
              <div className="onboard-check onboard-check--pending" />
              <span>Set Payment Method</span>
            </li>
          </ul>
        </section>

        {/* Q4 Volume Growth */}
        <section className="dash-card dash-card--analytics">
          <div className="analytics-header">
            <div>
              <h3 className="dash-card-title">Q4 Volume Growth</h3>
              <p className="analytics-sub">Performance tracking vs last year</p>
            </div>
            <div className="analytics-growth">+{MOCK_ANALYTICS.q4Growth}%</div>
          </div>
          <div className="analytics-chart">
            {MOCK_ANALYTICS.monthlyVolumes.map((m, i) => (
              <div className="chart-bar-col" key={m.month}>
                <div className="chart-bar-wrap">
                  <div
                    className={`chart-bar${i === MOCK_ANALYTICS.monthlyVolumes.length - 1 ? ' chart-bar--active' : ''}`}
                    style={{ height: `${(m.value / 35000) * 100}%` }}
                  />
                </div>
                <span className="chart-label">{m.month}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Orders */}
        <section className="dash-card dash-card--orders">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Recent Orders</h3>
            <Link href="/my-orders" className="ivg-btn--tertiary">See all activity</Link>
          </div>
          <table className="portal-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.ivg_orderdraftid}>
                  <td><strong>{order.ivg_orderdraftnumber}</strong></td>
                  <td><span className={`status-pill status-pill--${getOrderStatusClass(order.ivg_status)}`}>{order.ivg_status}</span></td>
                  <td className="text-secondary">{new Date(order.ivg_orderdate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td style={{ textAlign: 'right' }}>£{order.ivg_totalgross?.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Support Cases */}
        <section className="dash-card dash-card--support">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Support Tickets</h3>
            <Link href="/support" className="open-cases-count">
              {openTickets.length}
            </Link>
          </div>
          {openTickets.map(ticket => (
            <div className="support-preview" key={ticket.incidentid}>
              <div className="support-preview-header">
                <span className={`status-pill status-pill--${getTicketStatusClass(ticket.statuscode)}`}>
                  {getTicketStatusLabel(ticket.statuscode)}
                </span>
                <span className="text-secondary">{ticket.ticketnumber}</span>
              </div>
              <h4>{ticket.title}</h4>
              <p className="text-secondary">{ticket.description?.slice(0, 100)}...</p>
            </div>
          ))}
          <Link href="/support/new" className="ivg-btn ivg-btn--secondary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>
            Open New Case
          </Link>
        </section>
      </div>
    </div>
  );
}
