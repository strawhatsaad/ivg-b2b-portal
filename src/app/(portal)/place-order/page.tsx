'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { apiCreate } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

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

  const { products } = useProducts();
  const { orders } = useOrders();
  const { user } = useAuth();

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.ivg_flavour && p.ivg_flavour.toLowerCase().includes(q)) ||
      (p.productnumber && p.productnumber.toLowerCase().includes(q)) ||
      (p.ivg_productline && p.ivg_productline.toLowerCase().includes(q))
    );
  }, [searchQuery, products]);

  const productLines = useMemo(() => {
    const groups: Record<string, typeof products> = {};
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
    if (filteredProducts.length === 1 && filteredProducts[0].name.toLowerCase() === searchQuery.toLowerCase()) {
      return [];
    }
    return filteredProducts.slice(0, 8);
  }, [searchQuery, filteredProducts]);

  const cartItems: CartItem[] = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([pid, qty]) => {
        const product = products.find(p => p.productid === pid);
        if (!product) return null;
        return {
          productId: pid,
          name: product.name,
          quantity: qty,
          unitPrice: product.price || 0,
          vatRate: product.ivg_vatrate || 20,
        };
      }).filter(Boolean) as CartItem[];
  }, [cart, products]);

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
    const pos = orders.map(o => o.ivg_ponumber).filter(Boolean) as string[];
    let maxNum = 0;
    pos.forEach(po => {
      const match = po.match(/-0*(\d+)$/);
      if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10));
    });
    return `PO-DEV-2026-${String(maxNum + 1).padStart(3, '0')}`;
  }, [orders]);

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const orderId = await apiCreate('ivg_orderdrafts', {
        ivg_ponumber: nextPONumber,
        ivg_customernotes: notes || undefined,
        ivg_status: 'Submitted',
        ivg_totalgross: totals.gross,
        ivg_totalnetamount: totals.net,
        ivg_vatamount: totals.vat,
        ...(user?.accountId ? { 'ivg_account@odata.bind': `/accounts(${user.accountId})` } : {})
      });

      // Quick fallback: if we can't deep-insert, wait and then sequentially create lines
      for (const item of cartItems) {
        await apiCreate('ivg_orderdraftlines', {
          ivg_productname: item.name,
          ivg_quantity: item.quantity,
          ivg_unitprice: item.unitPrice,
          ivg_netamount: item.quantity * item.unitPrice,
          ivg_vatpercent: item.vatRate,
          ivg_vatamount: (item.quantity * item.unitPrice) * (item.vatRate / 100),
          ivg_grossamount: (item.quantity * item.unitPrice) * (1 + item.vatRate / 100),
          'ivg_OrderDraft@odata.bind': `/ivg_orderdrafts(${orderId})`,
          'ivg_Product@odata.bind': `/products(${item.productId})`
        }).catch(err => console.error('Line item creation failed', err));
      }

      router.push(`/order-confirmation?id=${orderId}`);
    } catch (err: any) {
      console.error(err);
      alert('Failed to submit order: ' + err.message);
      setSubmitting(false);
    }
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
                <p className="text-secondary" style={{ marginBottom: 16 }}>No products found matching &quot;{searchQuery}&quot;</p>
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
