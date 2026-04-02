'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createTicket } from '@/lib/mock-store';

export default function NewSupportCasePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: '',
    priority: 'Medium',
    description: '',
    orderRef: '',
  });

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));

    const ticket = createTicket({
      title: form.title,
      category: form.category,
      priority: form.priority,
      description: form.description,
      orderRef: form.orderRef || undefined,
    });

    router.push(`/support/${ticket.incidentid}`);
  };

  return (
    <div className="portal-page">
      <header className="page-header">
        <div>
          <Link href="/support" className="back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            Back to Support
          </Link>
          <h1>Create New Case</h1>
          <p className="text-secondary">Submit a support request and our team will respond within 4 hours.</p>
        </div>
      </header>

      <div className="form-page-card">
        <form onSubmit={handleSubmit}>
          <div className="ivg-form-group">
            <label>Subject <span className="required">*</span></label>
            <input
              className="ivg-input"
              placeholder="Brief description of your issue"
              value={form.title}
              onChange={e => update('title', e.target.value)}
              required
            />
          </div>

          <div className="ivg-form-row">
            <div className="ivg-form-group">
              <label>Category <span className="required">*</span></label>
              <select className="ivg-input" value={form.category} onChange={e => update('category', e.target.value)} required>
                <option value="">Select category</option>
                <option value="delivery">Delivery Issue</option>
                <option value="billing">Billing</option>
                <option value="compliance">Compliance</option>
                <option value="technical">Technical</option>
                <option value="general">General Enquiry</option>
              </select>
            </div>
            <div className="ivg-form-group">
              <label>Priority</label>
              <select className="ivg-input" value={form.priority} onChange={e => update('priority', e.target.value)}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="ivg-form-group">
            <label>Related Order (optional)</label>
            <input
              className="ivg-input"
              placeholder="e.g. #IVG-98442"
              value={form.orderRef}
              onChange={e => update('orderRef', e.target.value)}
            />
          </div>

          <div className="ivg-form-group">
            <label>Description <span className="required">*</span></label>
            <textarea
              className="ivg-input"
              rows={6}
              placeholder="Please describe your issue in detail..."
              value={form.description}
              onChange={e => update('description', e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
            <Link href="/support" className="ivg-btn ivg-btn--secondary">Cancel</Link>
            <button type="submit" className="ivg-btn ivg-btn--primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
