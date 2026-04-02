'use client';

import Link from 'next/link';

export default function ApplicationSubmittedPage() {
  return (
    <div className="submitted-page">
      <div className="submitted-card">
        <div className="submitted-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--ivg-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h1>Application Submitted</h1>
        <p className="submitted-sub">
          Thank you for applying to the IVG B2B Trade Portal. Your application has been received and is being reviewed by our team.
        </p>

        <div className="submitted-details">
          <div className="submitted-detail-row">
            <span>Reference Number</span>
            <strong>#APP-2026-0847</strong>
          </div>
          <div className="submitted-detail-row">
            <span>Expected Review Time</span>
            <strong>1–2 Business Days</strong>
          </div>
          <div className="submitted-detail-row">
            <span>Confirmation Email</span>
            <strong>Sent to Saad.Anjum@devsinc.com</strong>
          </div>
        </div>

        <div className="submitted-next">
          <h3>What happens next?</h3>
          <ol>
            <li>Our team will verify your business details and documentation</li>
            <li>You&apos;ll receive an email once your account is approved</li>
            <li>Sign in with your Microsoft Entra ID to access the portal</li>
          </ol>
        </div>

        <div className="submitted-actions">
          <Link href="/" className="ivg-btn ivg-btn--primary">
            Return to Home
          </Link>
          <Link href="/sign-in" className="ivg-btn ivg-btn--secondary">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
