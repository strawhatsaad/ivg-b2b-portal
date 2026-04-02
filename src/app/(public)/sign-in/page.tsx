'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { login } from '@/lib/auth-actions';

export default function SignInPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [signingIn, setSigningIn] = useState(false);
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';

  useEffect(() => {
    if (!loading && user) {
      router.replace(returnUrl);
    }
  }, [user, loading, router, returnUrl]);

  const handleSignIn = async () => {
    setSigningIn(true);
    await new Promise(r => setTimeout(r, 1200));
    login(returnUrl);
  };

  return (
    <div className="signin-split">
      {/* Left — Big IVG Logo */}
      <div className="signin-left">
        <div className="signin-left-inner">
          <img src="/ivglogo.png" alt="IVG" className="signin-left-logo" />
          <h2>B2B Trade Portal</h2>
          <p>Your enterprise gateway to wholesale distribution, credit management, and logistics oversight.</p>
          <div className="signin-left-features">
            <div className="signin-feature">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              <span>Wholesale pricing & bulk ordering</span>
            </div>
            <div className="signin-feature">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              <span>Real-time credit & billing management</span>
            </div>
            <div className="signin-feature">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              <span>Enterprise support & case tracking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Entra ID Login */}
      <div className="signin-right">
        <div className="signin-right-inner">
          <div className="signin-right-header">
            <h1>Sign in</h1>
            <p>Access your IVG B2B Portal account</p>
          </div>

          <div className="entra-card">
            <div className="entra-card-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Enterprise Single Sign-On</span>
            </div>

            <button
              className="entra-btn"
              onClick={handleSignIn}
              disabled={signingIn}
            >
              {signingIn ? (
                <div className="entra-btn-loading">
                  <div className="ivg-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <svg className="entra-icon" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                  </svg>
                  <span>Sign in with Microsoft Entra ID</span>
                </>
              )}
            </button>

            <p className="entra-help">
              Uses your organization&apos;s Microsoft Entra ID for secure authentication.
            </p>
          </div>

          <div className="signin-divider">
            <span>or</span>
          </div>

          <div className="signin-alt">
            <p>New to IVG B2B Portal?</p>
            <Link href="/register" className="ivg-btn ivg-btn--secondary" style={{ width: '100%', justifyContent: 'center' }}>
              Apply to Trade
            </Link>
          </div>

          <p className="signin-footer-text">
            By signing in, you agree to IVG&apos;s Terms of Service and Privacy Policy.
            This portal is for authorized trade partners only.
          </p>
        </div>
      </div>
    </div>
  );
}
