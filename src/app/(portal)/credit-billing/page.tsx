'use client';

import React from 'react';
import { MOCK_PAYMENTS } from '@/lib/mock-db';
import { useAccount } from '@/hooks/useAccount';

export default function CreditBillingPage() {
  const { account } = useAccount();
  const limit = account?.creditlimit ?? 50000;
  const available = account?.creditlimit ?? limit; // Fallback to full limit if order lines are not calculated yet
  const utilizedPct = limit > 0 ? ((limit - available) / limit) * 100 : 0;
  const totalUsed = limit - available;
  const nextBillingDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString();
  const paymentTerms = account?.['paymenttermscode@OData.Community.Display.V1.FormattedValue'] || 'Net 30';
  return (
    <div className="portal-page">
      <header className="page-header">
        <div>
          <h1>Credit Account</h1>
          <p className="text-secondary">Manage your enterprise credit line, view utilization, and settle outstanding balances.</p>
        </div>
        <button className="ivg-btn ivg-btn--secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
          Export Statement
        </button>
      </header>

      {/* Credit Overview Cards */}
      <div className="credit-overview">
        <div className="credit-main-card">
          <span className="credit-main-label">Available Credit</span>
          <h2 className="credit-main-amount">£{available.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</h2>
          <div className="credit-main-bar">
            <div className="credit-main-bar-fill" style={{ width: `${utilizedPct}%` }} />
          </div>
          <div className="credit-main-meta">
            <span>Used: £{totalUsed.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</span>
            <span>Total: £{limit.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
        <div className="credit-side-cards">
          <div className="credit-side-card">
            <span className="credit-side-label">Utilization</span>
            <span className="credit-side-value">{utilizedPct.toFixed(0)}%</span>
          </div>
          <div className="credit-side-card">
            <span className="credit-side-label">Total Limit</span>
            <span className="credit-side-value">£{limit.toLocaleString('en-GB')}</span>
          </div>
          <div className="credit-side-card">
            <span className="credit-side-label">Next Billing</span>
            <span className="credit-side-value">{new Date(nextBillingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          <div className="credit-side-card">
            <span className="credit-side-label">Payment Terms</span>
            <span className="credit-side-value">{paymentTerms}</span>
          </div>
        </div>
      </div>

      {/* Credit Tip */}
      <div className="credit-tip">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ivg-primary)" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
        <div>
          <strong>Credit Tip: Optimizing Your Score</strong>
          <p className="text-secondary">Maintaining a utilization rate below 50% consistently demonstrates strong financial health to creditors. You&apos;re currently at {utilizedPct.toFixed(0)}%. Consider a partial repayment to lower it.</p>
        </div>
      </div>

      {/* Payment History */}
      <div className="table-card" style={{ marginTop: 32 }}>
        <div className="dash-card-header">
          <h3 className="table-card-title">Payment History</h3>
        </div>
        <table className="portal-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_PAYMENTS.map(p => (
              <tr key={p.id}>
                <td className="text-secondary">
                  {new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td><strong>{p.description}</strong></td>
                <td><span className={`status-pill status-pill--${p.status === 'Paid' ? 'delivered' : p.status === 'Pending' ? 'processing' : 'open'}`}>{p.status}</span></td>
                <td style={{ textAlign: 'right' }}>£{p.amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Business Perks */}
      <div className="perks-section">
        <h3 className="table-card-title">Gold Tier Business Perks</h3>
        <div className="perks-grid">
          <div className="perk-card">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--ivg-primary)" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
            <h4>Global Access</h4>
            <p className="text-secondary">Seamless procurement across 80+ distribution hubs worldwide with local currency support.</p>
          </div>
          <div className="perk-card">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--ivg-primary)" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            <h4>24/7 VIP Support</h4>
            <p className="text-secondary">Dedicated account managers with guaranteed 4h response time and priority escalation.</p>
          </div>
          <div className="perk-card">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--ivg-primary)" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
            <h4>Dynamic Scaling</h4>
            <p className="text-secondary">Automatic credit limit adjustments based on order volume and payment consistency.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
