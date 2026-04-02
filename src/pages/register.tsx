'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    customerType: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/new-customer-application');
  };

  const update = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-hero">
          <h1>Apply to Trade</h1>
          <p>Join over 5,000 global distributors partnered with IVG for premium e-liquid wholesale distribution.</p>
          <div className="register-perks">
            <div className="register-perk">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ivg-primary)" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
              <span>Wholesale pricing from £2.50/unit</span>
            </div>
            <div className="register-perk">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ivg-primary)" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
              <span>Net-30 credit terms available</span>
            </div>
            <div className="register-perk">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ivg-primary)" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
              <span>Priority access to new product launches</span>
            </div>
            <div className="register-perk">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ivg-primary)" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
              <span>Dedicated account manager</span>
            </div>
          </div>
        </div>

        <div className="register-form-card">
          <h2>Get Started</h2>
          <p className="register-form-sub">Tell us about your business</p>
          <form onSubmit={handleSubmit}>
            <div className="ivg-form-group">
              <label>Company Name <span className="required">*</span></label>
              <input
                className="ivg-input"
                type="text"
                placeholder="e.g. Devsinc Distribution Ltd"
                value={formData.companyName}
                onChange={e => update('companyName', e.target.value)}
                required
              />
            </div>
            <div className="ivg-form-group">
              <label>Contact Full Name <span className="required">*</span></label>
              <input
                className="ivg-input"
                type="text"
                placeholder="e.g. Saad Anjum"
                value={formData.contactName}
                onChange={e => update('contactName', e.target.value)}
                required
              />
            </div>
            <div className="ivg-form-group">
              <label>Business Email <span className="required">*</span></label>
              <input
                className="ivg-input"
                type="email"
                placeholder="e.g. saad@devsinc.com"
                value={formData.email}
                onChange={e => update('email', e.target.value)}
                required
              />
            </div>
            <div className="ivg-form-group">
              <label>Phone Number <span className="required">*</span></label>
              <input
                className="ivg-input"
                type="tel"
                placeholder="+44 7XXX XXX XXX"
                value={formData.phone}
                onChange={e => update('phone', e.target.value)}
                required
              />
            </div>
            <div className="ivg-form-group">
              <label>Customer Type <span className="required">*</span></label>
              <select
                className="ivg-input"
                value={formData.customerType}
                onChange={e => update('customerType', e.target.value)}
                required
              >
                <option value="">Select your business type</option>
                <option value="distributor">Distributor</option>
                <option value="retailer">Retailer / Vape Shop</option>
                <option value="wholesale">Wholesaler</option>
                <option value="online">Online Retailer</option>
              </select>
            </div>
            <button type="submit" className="ivg-btn ivg-btn--primary ivg-btn--lg" style={{ width: '100%', justifyContent: 'center' }}>
              Continue Application
            </button>
          </form>
          <p className="register-signin-link">
            Already have an account? <Link href="/sign-in">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
