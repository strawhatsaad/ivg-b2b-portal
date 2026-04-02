'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { MOCK_PRODUCTS, MOCK_ORDERS } from '@/lib/mock-db';
import { createOrder } from '@/lib/mock-store';

interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
}

export default function PlaceOrderPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedLine, setExpandedLine] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const ITEMS_PER_PAGE = 6;

  // Filter products by search query BEFORE grouping
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_PRODUCTS;
    const q = searchQuery.toLowerCase();
    return MOCK_PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(q) ||
      (p.ivg_flavour && p.ivg_flavour.toLowerCase().includes(q)) ||
      (p.productnumber && p.productnumber.toLowerCase().includes(q)) ||
      (p.ivg_productline && p.ivg_productline.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // Group filtered products by product line
  const productLines = useMemo(() => {
    const groups: Record<string, typeof MOCK_PRODUCTS> = {};
    filteredProducts.forEach(p => {
      const line = p.ivg_productline || 'Other';
      if (!groups[line]) groups[line] = [];
      groups[line].push(p);
    });
    return groups;
  }, [filteredProducts]);

  const productLineEntries = useMemo(() => Object.entries(productLines), [productLines]);
  const totalPages = Math.ceil(productLineEntries.length / ITEMS_PER_PAGE);
  
  const currentProductLines = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return productLineEntries.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [productLineEntries, currentPage]);

  const autocompleteOptions = useMemo(() => {
    if (!searchQuery.trim() || filteredProducts.length === 0) return [];
    // If the top exact match is identical to what they typed, they don't need options
    if (filteredProducts.length === 1 && filteredProducts[0].name.toLowerCase() === searchQuery.toLowerCase()) {
      return [];
    }
    return filteredProducts.slice(0, 8);
  }, [searchQuery, filteredProducts]);

  const cartItems: CartItem[] = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([pid, qty]) => {
        const product = MOCK_PRODUCTS.find(p => p.productid === pid)!;
        return {
          productId: pid,
          name: product.name,
          quantity: qty,
          unitPrice: product.price || 0,
          vatRate: product.ivg_vatrate || 20,
        };
      });
  }, [cart]);

  const totals = useMemo(() => {
    let net = 0;
    let vat = 0;
    cartItems.forEach(item => {
      const lineNet = item.quantity * item.unitPrice;
      net += lineNet;
      vat += lineNet * (item.vatRate / 100);
    });
    return { net, vat, gross: net + vat, items: cartItems.reduce((s, i) => s + i.quantity, 0) };
  }, [cartItems]);

  const updateQty = (productId: string, qty: number) => {
    setCart(prev => ({ ...prev, [productId]: Math.max(0, qty) }));
  };

  const nextPONumber = useMemo(() => {
    // Find highest trailing number in MOCK_ORDERS
    const pos = MOCK_ORDERS.map(o => o.ivg_ponumber).filter(Boolean) as string[];
    let maxNum = 0;
    pos.forEach(po => {
      const match = po.match(/-0*(\d+)$/);
      if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10));
    });
    return `PO-DEV-2026-${String(maxNum + 1).padStart(3, '0')}`;
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));

    const order = createOrder({
      lines: cartItems.map(item => ({
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        vatRate: item.vatRate,
      })),
      poNumber: nextPONumber,
      notes: notes || undefined,
    });

    router.push(`/order-confirmation?id=${order.ivg_orderdraftid}`);
  };

  return (
    <div className="portal-page">
      <header className="page-header">
        <div>
          <h1>Place Order</h1>
          <p className="text-secondary">Browse our product catalog and add items to your order</p>
        </div>
      </header>

      <div className="order-layout">
        {/* Product Catalog */}
        <div className="order-catalog">
          
          <div className="catalog-search-container">
            <div className="search-input-wrapper">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input 
                type="text" 
                className="ivg-input search-input" 
                placeholder="Search products by flavor, name, or SKU..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              />
            </div>
            {isSearchFocused && autocompleteOptions.length > 0 && (
              <ul className="autocomplete-dropdown">
                {autocompleteOptions.map(option => (
                  <li 
                    key={option.productid} 
                    onClick={() => {
                      setSearchQuery(option.name);
                      setCurrentPage(1);
                    }}
                  >
                    <div className="ac-title">{option.name}</div>
                    <div className="ac-subtitle">
                      <span>{option.productnumber}</span> — <span>{option.ivg_productline}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="product-tile-grid">
            {productLineEntries.length === 0 ? (
              <div className="empty-catalog-state" style={{ padding: '64px 24px', textAlign: 'center', gridColumn: '1 / -1' }}>
                <p className="text-secondary" style={{ marginBottom: 16 }}>No products found matching "{searchQuery}"</p>
                <button className="ivg-btn ivg-btn--secondary" onClick={() => { setSearchQuery(''); setCurrentPage(1); }}>Clear Search</button>
              </div>
            ) : currentProductLines.map(([lineName, products]) => {
              return (
                <div className="product-tile" key={lineName}>
                  <div className="tile-image-placeholder">
                    {!imageErrors.has(lineName) ? (
                      <img 
                        src={`/products/${lineName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}.png`} 
                        alt={lineName}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={() => setImageErrors(prev => new Set(prev).add(lineName))}
                      />
                    ) : (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    )}
                  </div>
                  <div className="product-tile-header">
                    <h3>{lineName}</h3>
                    <span className="product-line-count">{products.length} products</span>
                  </div>
                  <div className="tile-variants-list">
                    <table className="portal-table product-table">
                      <thead>
                        <tr>
                          <th>Flavor/SKU</th>
                          <th style={{ textAlign: 'center' }}>Vol</th>
                          <th style={{ textAlign: 'right' }}>Price</th>
                          <th style={{ textAlign: 'center' }}>Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(p => (
                          <tr key={p.productid}>
                            <td>
                              <div style={{ fontWeight: 600, fontSize: '13px', lineHeight: 1.2 }}>{p.ivg_flavour}</div>
                              <div className="text-secondary" style={{ fontSize: '11px', marginTop: 4 }}>{p.productnumber}</div>
                            </td>
                            <td style={{ textAlign: 'center' }}><span className="strength-badge">{p.ivg_nicstrength}</span></td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>£{p.price?.toFixed(2)}</td>
                            <td>
                              <div className="qty-control">
                                <button
                                  className="qty-btn"
                                  onClick={() => updateQty(p.productid, (cart[p.productid] || 0) - 10)}
                                  disabled={(cart[p.productid] || 0) <= 0}
                                >−</button>
                                <input
                                  type="number"
                                  className="qty-input"
                                  value={cart[p.productid] || 0}
                                  onChange={e => updateQty(p.productid, parseInt(e.target.value) || 0)}
                                  min={0}
                                  step={10}
                                />
                                <button
                                  className="qty-btn"
                                  onClick={() => updateQty(p.productid, (cart[p.productid] || 0) + 10)}
                                >+</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="pagination-controls">
              <button 
                className="ivg-btn ivg-btn--secondary" 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="pagination-indicator">Page {currentPage} of {totalPages}</span>
              <button 
                className="ivg-btn ivg-btn--secondary" 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="order-summary-panel">
          <div className="order-summary-card">
            <h3>Order Summary</h3>
            {cartItems.length === 0 ? (
              <p className="text-secondary" style={{ padding: '24px 0', textAlign: 'center' }}>No items added yet</p>
            ) : (
              <>
                <div className="summary-items">
                  {cartItems.map(item => (
                    <div className="summary-item" key={item.productId}>
                      <span>{item.name}</span>
                      <span>×{item.quantity}</span>
                      <span>£{(item.quantity * item.unitPrice).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="summary-totals">
                  <div className="summary-row">
                    <span>Subtotal ({totals.items} units)</span>
                    <span>£{totals.net.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>VAT (20%)</span>
                    <span>£{totals.vat.toFixed(2)}</span>
                  </div>
                  <div className="summary-row summary-row--total">
                    <span>Total</span>
                    <span>£{totals.gross.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}

            <div className="summary-fields">
              <div className="ivg-form-group">
                <label>PO Number</label>
                <input 
                  className="ivg-input" 
                  value={nextPONumber} 
                  readOnly 
                  style={{ backgroundColor: 'var(--ivg-surface-container-low)', color: 'var(--ivg-secondary)', cursor: 'not-allowed', border: '1px solid transparent' }} 
                />
              </div>
              <div className="ivg-form-group">
                <label>Notes</label>
                <textarea className="ivg-input" rows={3} placeholder="Special delivery instructions..." value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            </div>

            <button
              className="ivg-btn ivg-btn--primary ivg-btn--lg"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={cartItems.length === 0 || submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Submitting...' : `Submit Order — £${totals.gross.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
