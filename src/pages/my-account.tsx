'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { MOCK_ACCOUNT } from '@/lib/mock-db';

export default function MyAccountPage() {
  const { user } = useAuth();

  return (
    <div className="portal-page">
      <header className="page-header">
        <div>
          <h1>My Account</h1>
          <p className="text-secondary">Manage your profile and business settings</p>
        </div>
      </header>

      <div className="account-grid">
        {/* Profile Card */}
        <div className="account-card">
          <div className="account-avatar-section">
            <div className="account-avatar">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div>
              <h2>{user?.firstName} {user?.lastName}</h2>
              <p className="text-secondary">{user?.userName}</p>
              <span className="dash-badge" style={{ marginTop: 8 }}>Gold Tier Partner</span>
            </div>
          </div>

          <div className="account-details">
            <h3 className="table-card-title">Contact Information</h3>
            <div className="detail-grid">
              <div>
                <span className="detail-label">Full Name</span>
                <span className="detail-value">{user?.firstName} {user?.lastName}</span>
              </div>
              <div>
                <span className="detail-label">Email</span>
                <span className="detail-value">{user?.userName}</span>
              </div>
              <div>
                <span className="detail-label">Phone</span>
                <span className="detail-value">+44 7XXX XXX 123</span>
              </div>
              <div>
                <span className="detail-label">Role</span>
                <span className="detail-value">Account Administrator</span>
              </div>
            </div>
          </div>
        </div>

        {/* Business Card */}
        <div className="account-card">
          <h3 className="table-card-title">Business Information</h3>
          <div className="detail-grid">
            <div>
              <span className="detail-label">Company Name</span>
              <span className="detail-value">{MOCK_ACCOUNT.name}</span>
            </div>
            <div>
              <span className="detail-label">Account ID</span>
              <span className="detail-value" style={{ fontFamily: 'monospace', fontSize: 12 }}>{MOCK_ACCOUNT.accountid.slice(0, 8)}...</span>
            </div>
            <div>
              <span className="detail-label">Customer Tier</span>
              <span className="detail-value">
                <span className="tier-badge tier-badge--gold">{MOCK_ACCOUNT.ivg_customertier}</span>
              </span>
            </div>
            <div>
              <span className="detail-label">Customer Type</span>
              <span className="detail-value">{MOCK_ACCOUNT.ivg_customertype}</span>
            </div>
            <div>
              <span className="detail-label">Credit Limit</span>
              <span className="detail-value">£{MOCK_ACCOUNT.ivg_creditlimit?.toLocaleString('en-GB')}</span>
            </div>
            <div>
              <span className="detail-label">Available Credit</span>
              <span className="detail-value">£{MOCK_ACCOUNT.ivg_creditavailable?.toLocaleString('en-GB')}</span>
            </div>
          </div>

          <h3 className="table-card-title" style={{ marginTop: 32 }}>Registered Address</h3>
          <div className="detail-grid">
            <div>
              <span className="detail-label">Street</span>
              <span className="detail-value">123 Business Park</span>
            </div>
            <div>
              <span className="detail-label">City</span>
              <span className="detail-value">London</span>
            </div>
            <div>
              <span className="detail-label">County</span>
              <span className="detail-value">Greater London</span>
            </div>
            <div>
              <span className="detail-label">Postcode</span>
              <span className="detail-value">EC1A 1BB</span>
            </div>
          </div>
        </div>

        {/* Web Roles */}
        <div className="account-card">
          <h3 className="table-card-title">Assigned Roles</h3>
          <div className="roles-list">
            {user?.roles?.map(role => (
              <div className="role-chip" key={role}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ivg-primary)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                {role}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
