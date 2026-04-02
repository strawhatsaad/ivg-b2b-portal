'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';

const STEPS = ['Company Details', 'Delivery Address', 'Billing Details', 'Bank & Signatory'];

export default function NewCustomerApplicationPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    // Company
    companyName: 'Devsinc Distribution Ltd',
    vatNumber: 'GB123456789',
    companiesHouseNo: '12345678',
    companyStreet: '123 Business Park',
    companyCity: 'London',
    companyCounty: 'Greater London',
    companyPostcode: 'EC1A 1BB',
    // Delivery
    deliveryStreet: '45 Warehouse Lane',
    deliveryCity: 'Manchester',
    deliveryCounty: 'Greater Manchester',
    deliveryPostcode: 'M1 2AB',
    // Billing
    billingStreet: '123 Business Park',
    billingCity: 'London',
    billingCounty: 'Greater London',
    billingPostcode: 'EC1A 1BB',
    // Bank & Signatory
    bankAccountName: 'Devsinc Distribution Ltd',
    signatoryName: 'Saad Anjum',
    signedBehalfOf: 'Devsinc Distribution Ltd',
    signatoryTitle: 'Managing Director',
  });

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const nextStep = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else router.push('/application-submitted');
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="application-page">
      <div className="application-container">
        <div className="application-header">
          <h1>New Customer Application</h1>
          <p>Complete all sections to submit your trade application</p>
        </div>

        {/* Progress */}
        <div className="form-progress">
          {STEPS.map((label, i) => (
            <div key={label} className={`progress-step${i === step ? ' active' : ''}${i < step ? ' done' : ''}`}>
              <div className="progress-dot">
                {i < step ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span className="progress-label">{label}</span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="application-form-card">
          {step === 0 && (
            <div className="form-step">
              <h2 className="form-step-title">Company Details</h2>
              <div className="ivg-form-group">
                <label>Company Name <span className="required">*</span></label>
                <input className="ivg-input" value={form.companyName} onChange={e => update('companyName', e.target.value)} />
              </div>
              <div className="ivg-form-row">
                <div className="ivg-form-group">
                  <label>VAT Number</label>
                  <input className="ivg-input" value={form.vatNumber} onChange={e => update('vatNumber', e.target.value)} />
                </div>
                <div className="ivg-form-group">
                  <label>Companies House No.</label>
                  <input className="ivg-input" value={form.companiesHouseNo} onChange={e => update('companiesHouseNo', e.target.value)} />
                </div>
              </div>
              <h3 className="ivg-form-section-heading">Registered Address</h3>
              <div className="ivg-form-group">
                <label>Street Address <span className="required">*</span></label>
                <input className="ivg-input" value={form.companyStreet} onChange={e => update('companyStreet', e.target.value)} />
              </div>
              <div className="ivg-form-row--3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div className="ivg-form-group">
                  <label>City <span className="required">*</span></label>
                  <input className="ivg-input" value={form.companyCity} onChange={e => update('companyCity', e.target.value)} />
                </div>
                <div className="ivg-form-group">
                  <label>County</label>
                  <input className="ivg-input" value={form.companyCounty} onChange={e => update('companyCounty', e.target.value)} />
                </div>
                <div className="ivg-form-group">
                  <label>Postcode <span className="required">*</span></label>
                  <input className="ivg-input" value={form.companyPostcode} onChange={e => update('companyPostcode', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="form-step">
              <h2 className="form-step-title">Delivery Address</h2>
              <div className="ivg-form-group">
                <label>Street Address <span className="required">*</span></label>
                <input className="ivg-input" value={form.deliveryStreet} onChange={e => update('deliveryStreet', e.target.value)} />
              </div>
              <div className="ivg-form-row--3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div className="ivg-form-group">
                  <label>City <span className="required">*</span></label>
                  <input className="ivg-input" value={form.deliveryCity} onChange={e => update('deliveryCity', e.target.value)} />
                </div>
                <div className="ivg-form-group">
                  <label>County</label>
                  <input className="ivg-input" value={form.deliveryCounty} onChange={e => update('deliveryCounty', e.target.value)} />
                </div>
                <div className="ivg-form-group">
                  <label>Postcode <span className="required">*</span></label>
                  <input className="ivg-input" value={form.deliveryPostcode} onChange={e => update('deliveryPostcode', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <h2 className="form-step-title">Billing Details</h2>
              <div className="ivg-form-group">
                <label>Street Address <span className="required">*</span></label>
                <input className="ivg-input" value={form.billingStreet} onChange={e => update('billingStreet', e.target.value)} />
              </div>
              <div className="ivg-form-row--3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div className="ivg-form-group">
                  <label>City <span className="required">*</span></label>
                  <input className="ivg-input" value={form.billingCity} onChange={e => update('billingCity', e.target.value)} />
                </div>
                <div className="ivg-form-group">
                  <label>County</label>
                  <input className="ivg-input" value={form.billingCounty} onChange={e => update('billingCounty', e.target.value)} />
                </div>
                <div className="ivg-form-group">
                  <label>Postcode <span className="required">*</span></label>
                  <input className="ivg-input" value={form.billingPostcode} onChange={e => update('billingPostcode', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step">
              <h2 className="form-step-title">Bank &amp; Signatory</h2>
              <div className="ivg-form-group">
                <label>Bank Account Name <span className="required">*</span></label>
                <input className="ivg-input" value={form.bankAccountName} onChange={e => update('bankAccountName', e.target.value)} />
              </div>
              <h3 className="ivg-form-section-heading">Authorised Signatory</h3>
              <div className="ivg-form-row">
                <div className="ivg-form-group">
                  <label>Signatory Name <span className="required">*</span></label>
                  <input className="ivg-input" value={form.signatoryName} onChange={e => update('signatoryName', e.target.value)} />
                </div>
                <div className="ivg-form-group">
                  <label>Title / Position <span className="required">*</span></label>
                  <input className="ivg-input" value={form.signatoryTitle} onChange={e => update('signatoryTitle', e.target.value)} />
                </div>
              </div>
              <div className="ivg-form-group">
                <label>Signed on behalf of <span className="required">*</span></label>
                <input className="ivg-input" value={form.signedBehalfOf} onChange={e => update('signedBehalfOf', e.target.value)} />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="form-nav">
            {step > 0 && (
              <button type="button" className="ivg-btn ivg-btn--secondary" onClick={prevStep}>
                Back
              </button>
            )}
            <button type="button" className="ivg-btn ivg-btn--primary" onClick={nextStep} style={{ marginLeft: 'auto' }}>
              {step === STEPS.length - 1 ? 'Submit Application' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
