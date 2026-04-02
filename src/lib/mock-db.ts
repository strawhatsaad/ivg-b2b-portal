/**
 * Mock Database — Realistic IVG B2B Demo Data
 * All data keyed to the mock user's account (Saad Anjum @ Devsinc)
 */

import { OrderDraft, OrderDraftLine, Product, Account, Incident, CustomerTier } from './types';

// ─── Account ───
export const MOCK_ACCOUNT: Account = {
  accountid: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
  name: 'Devsinc Distribution Ltd',
  ivg_customertier: 'Gold' as CustomerTier,
  ivg_creditlimit: 50000,
  ivg_creditavailable: 24500,
  ivg_customertype: 'Distributor',
};

// ─── Credit Account ───
export interface CreditAccount {
  availableCredit: number;
  totalLimit: number;
  utilization: number;
  nextBillingDate: string;
  totalUsed: number;
  paymentTerms: string;
  accountStatus: string;
}

export const MOCK_CREDIT: CreditAccount = {
  availableCredit: 24500,
  totalLimit: 50000,
  utilization: 51,
  totalUsed: 25500,
  nextBillingDate: '2026-04-30',
  paymentTerms: 'Net 30',
  accountStatus: 'Active',
};

export interface PaymentRecord {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
}

export const MOCK_PAYMENTS: PaymentRecord[] = [
  { id: 'PAY-001', date: '2026-03-30', description: 'Mar Monthly Balance', amount: 4200, status: 'Paid' },
  { id: 'PAY-002', date: '2026-02-28', description: 'Feb Monthly Balance', amount: 3890, status: 'Paid' },
  { id: 'PAY-003', date: '2026-01-31', description: 'Jan Monthly Balance', amount: 5100, status: 'Paid' },
  { id: 'PAY-004', date: '2025-12-31', description: 'Dec Monthly Balance', amount: 8150, status: 'Paid' },
  { id: 'PAY-005', date: '2025-11-30', description: 'Nov Monthly Balance', amount: 3960, status: 'Paid' },
];

// ─── Products ───
export const MOCK_PRODUCTS: Product[] = [
  // ── IVG SMART MAX KIT ──
  { productid: 'smk-001', name: 'IVG Smart Max Kit — Blue Sour Raspberry', productnumber: 'SMK-BSR-10', ivg_productline: 'IVG SMART MAX KIT', ivg_flavour: 'Blue Sour Raspberry', ivg_nicstrength: '10mg', price: 24.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },
  { productid: 'smk-002', name: 'IVG Smart Max Kit — Classic Menthol', productnumber: 'SMK-CM-10', ivg_productline: 'IVG SMART MAX KIT', ivg_flavour: 'Classic Menthol', ivg_nicstrength: '10mg', price: 24.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },

  // ── IVG SMART MAX PODS ──
  { productid: 'smp-001', name: 'IVG Smart Max Pods — Blue Raspberry Ice', productnumber: 'SMP-BRI-10', ivg_productline: 'IVG SMART MAX PODS', ivg_flavour: 'Blue Raspberry Ice', ivg_nicstrength: '10mg', price: 4.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },
  { productid: 'smp-002', name: 'IVG Smart Max Pods — Triple Mango', productnumber: 'SMP-TM-10', ivg_productline: 'IVG SMART MAX PODS', ivg_flavour: 'Triple Mango', ivg_nicstrength: '10mg', price: 4.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },

  // ── IVG SAVR DEVICE ──
  { productid: 'svrd-001', name: 'IVG SAVR Device — Banana Ice', productnumber: 'SVRD-BI', ivg_productline: 'IVG SAVR DEVICE', ivg_flavour: 'Banana Ice', ivg_nicstrength: '—', price: 12.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },
  { productid: 'svrd-002', name: 'IVG SAVR Device — Blue Raspberry Ice', productnumber: 'SVRD-BRI', ivg_productline: 'IVG SAVR DEVICE', ivg_flavour: 'Blue Raspberry Ice', ivg_nicstrength: '—', price: 12.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },

  // ── IVG SAVR REFILLS ──
  { productid: 'svrr-001', name: 'IVG SAVR Refills — Classic Menthol', productnumber: 'SVRR-CM', ivg_productline: 'IVG SAVR REFILLS', ivg_flavour: 'Classic Menthol', ivg_nicstrength: '—', price: 4.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },
  { productid: 'svrr-002', name: 'IVG SAVR Refills — Strawberry Ice', productnumber: 'SVRR-SI', ivg_productline: 'IVG SAVR REFILLS', ivg_flavour: 'Strawberry Ice', ivg_nicstrength: '—', price: 4.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },

  // ── IVG XL 35 DEVICE ──
  { productid: 'xl35-001', name: 'IVG XL 35 Device — Blue Raspberry Ice', productnumber: '249', ivg_productline: 'IVG XL 35 DEVICE', ivg_flavour: 'Blue Raspberry Ice', ivg_nicstrength: '—', price: 19.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },
  { productid: 'xl35-002', name: 'IVG XL 35 Device — Peach Ice', productnumber: '514', ivg_productline: 'IVG XL 35 DEVICE', ivg_flavour: 'Peach Ice', ivg_nicstrength: '—', price: 19.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },

  // ── IVG AIR 4 IN 1 ──
  { productid: 'air4-001', name: 'IVG Air 4 in 1 — Red Edition', productnumber: 'AIR4-RED-20', ivg_productline: 'IVG AIR 4 IN 1', ivg_flavour: 'Red Edition', ivg_nicstrength: '20mg', price: 8.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },
  { productid: 'air4-002', name: 'IVG Air 4 in 1 — Blue Edition', productnumber: 'AIR4-BLU-20', ivg_productline: 'IVG AIR 4 IN 1', ivg_flavour: 'Blue Edition', ivg_nicstrength: '20mg', price: 8.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },

  // ── IVG AIR 2 IN 1 ──
  { productid: 'air2-001', name: 'IVG Air 2 in 1 — Black Edition', productnumber: 'AIR2-BLK-20', ivg_productline: 'IVG AIR 2 IN 1', ivg_flavour: 'Black Edition', ivg_nicstrength: '20mg', price: 6.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },
  { productid: 'air2-002', name: 'IVG Air 2 in 1 — Gold Edition', productnumber: 'AIR2-GLD-20', ivg_productline: 'IVG AIR 2 IN 1', ivg_flavour: 'Gold Edition', ivg_nicstrength: '20mg', price: 6.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },

  // ── IVG AIR PODS ──
  { productid: 'airp-001', name: 'IVG Air Pods — Blue Raspberry Ice', productnumber: '249', ivg_productline: 'IVG AIR PODS', ivg_flavour: 'Blue Raspberry Ice', ivg_nicstrength: '20mg', price: 3.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },
  { productid: 'airp-002', name: 'IVG Air Pods — Pineapple Ice', productnumber: '677', ivg_productline: 'IVG AIR PODS', ivg_flavour: 'Pineapple Ice', ivg_nicstrength: '20mg', price: 3.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },

  // ── IVG PRO KIT ──
  { productid: 'prok-001', name: 'IVG Pro Kit — Blue Raspberry Ice', productnumber: '249', ivg_productline: 'IVG PRO KIT', ivg_flavour: 'Blue Raspberry Ice', ivg_nicstrength: '10mg', price: 14.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },
  { productid: 'prok-002', name: 'IVG Pro Kit — Classic Menthol', productnumber: '214', ivg_productline: 'IVG PRO KIT', ivg_flavour: 'Classic Menthol', ivg_nicstrength: '10mg', price: 14.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },

  // ── IVG PRO PODS ──
  { productid: 'prop-001', name: 'IVG Pro Pods — Strawberry Ice', productnumber: '669', ivg_productline: 'IVG PRO PODS', ivg_flavour: 'Strawberry Ice', ivg_nicstrength: '0mg / 10mg / 20mg', price: 3.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },
  { productid: 'prop-002', name: 'IVG Pro Pods — Lemon Lime', productnumber: '787', ivg_productline: 'IVG PRO PODS', ivg_flavour: 'Lemon Lime', ivg_nicstrength: '0mg / 10mg / 20mg', price: 3.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },

  // ── IVG 2400 (N) ──
  { productid: '2400n-001', name: 'IVG 2400 — Menthol Edition', productnumber: '716', ivg_productline: 'IVG 2400 (N)', ivg_flavour: 'Menthol Edition', ivg_nicstrength: '20mg', price: 5.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },
  { productid: '2400n-002', name: 'IVG 2400 — Berry Edition', productnumber: '753', ivg_productline: 'IVG 2400 (N)', ivg_flavour: 'Berry Edition', ivg_nicstrength: '20mg', price: 5.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },

  // ── IVG 2400 RELOADS X2 ──
  { productid: '2400x2-001', name: 'IVG 2400 Reloads X2 — Strawberry Watermelon', productnumber: '2400X2-SW', ivg_productline: 'IVG 2400 RELOADS X2', ivg_flavour: 'Strawberry Watermelon', ivg_nicstrength: '20mg', price: 4.49, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },
  { productid: '2400x2-002', name: 'IVG 2400 Reloads X2 — Classic Menthol', productnumber: '2400X2-CM', ivg_productline: 'IVG 2400 RELOADS X2', ivg_flavour: 'Classic Menthol', ivg_nicstrength: '20mg', price: 4.49, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },

  // ── IVG 2400 RELOADS X4 ──
  { productid: '2400x4-001', name: 'IVG 2400 Reloads X4 — Berry Edition', productnumber: '753', ivg_productline: 'IVG 2400 RELOADS X4', ivg_flavour: 'Berry Edition', ivg_nicstrength: '20mg', price: 7.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },
  { productid: '2400x4-002', name: 'IVG 2400 Reloads X4 — Mango Edition', productnumber: '773', ivg_productline: 'IVG 2400 RELOADS X4', ivg_flavour: 'Mango Edition', ivg_nicstrength: '20mg', price: 7.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },

  // ── IVG INTENSE SALTS ──
  { productid: 'isal-001', name: 'IVG Intense Salts — Blue Sour Raspberry', productnumber: 'ISAL-BSR', ivg_productline: 'IVG INTENSE SALTS', ivg_flavour: 'Blue Sour Raspberry', ivg_nicstrength: '10mg / 20mg', price: 3.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },
  { productid: 'isal-002', name: 'IVG Intense Salts — Strawberry Kiwi', productnumber: 'ISAL-SK', ivg_productline: 'IVG INTENSE SALTS', ivg_flavour: 'Strawberry Kiwi', ivg_nicstrength: '10mg / 20mg', price: 3.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },

  // ── IVG SALTS 4 IN 1 ──
  { productid: 'sal4-001', name: 'IVG Salts 4 in 1 — Red Edition', productnumber: '714', ivg_productline: 'IVG SALTS 4 IN 1', ivg_flavour: 'Red Edition', ivg_nicstrength: '10mg', price: 5.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },
  { productid: 'sal4-002', name: 'IVG Salts 4 in 1 — Special Edition', productnumber: '719', ivg_productline: 'IVG SALTS 4 IN 1', ivg_flavour: 'Special Edition', ivg_nicstrength: '10mg', price: 5.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },

  // ── BEYOND SALTS ──
  { productid: 'bsal-001', name: 'Beyond Salts — Mangoberry Magic', productnumber: '226', ivg_productline: 'BEYOND SALTS', ivg_flavour: 'Mangoberry Magic', ivg_nicstrength: '10mg', price: 3.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },
  { productid: 'bsal-002', name: 'Beyond Salts — Berry Melonade Blitz', productnumber: '227', ivg_productline: 'BEYOND SALTS', ivg_flavour: 'Berry Melonade Blitz', ivg_nicstrength: '10mg', price: 3.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },

  // ── IVG SALTS EXOTIC ──
  { productid: 'esal-001', name: 'IVG Salts Exotic — Aloe Grape', productnumber: '648', ivg_productline: 'IVG SALTS EXOTIC', ivg_flavour: 'Aloe Grape', ivg_nicstrength: '10mg', price: 3.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },
  { productid: 'esal-002', name: 'IVG Salts Exotic — Sparkling Guava', productnumber: '649', ivg_productline: 'IVG SALTS EXOTIC', ivg_flavour: 'Sparkling Guava', ivg_nicstrength: '10mg', price: 3.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },

  // ── IVG 6000 SALTS ──
  { productid: '6sal-001', name: 'IVG 6000 Salts — Arctic Apple', productnumber: '721', ivg_productline: 'IVG 6000 SALTS', ivg_flavour: 'Arctic Apple', ivg_nicstrength: '10mg', price: 4.49, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },
  { productid: '6sal-002', name: 'IVG 6000 Salts — Blue Frost', productnumber: '724', ivg_productline: 'IVG 6000 SALTS', ivg_flavour: 'Blue Frost', ivg_nicstrength: '10mg', price: 4.49, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },

  // ── IVG SALT 50/50 ──
  { productid: 'fsal-001', name: 'IVG Salt 50/50 — Neon Lime', productnumber: '115', ivg_productline: 'IVG SALT 50/50', ivg_flavour: 'Neon Lime', ivg_nicstrength: '3mg / 6mg / 12mg / 18mg', price: 3.49, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },
  { productid: 'fsal-002', name: 'IVG Salt 50/50 — Forest Berries Ice', productnumber: '154', ivg_productline: 'IVG SALT 50/50', ivg_flavour: 'Forest Berries Ice', ivg_nicstrength: '3mg / 6mg / 12mg / 18mg', price: 3.49, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },

  // ── IVG BAR FAVOURITES ──
  { productid: 'bfav-001', name: 'IVG Bar Favourites — Rio Rush', productnumber: '477', ivg_productline: 'IVG BAR FAVOURITES', ivg_flavour: 'Rio Rush', ivg_nicstrength: '10mg', price: 3.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },
  { productid: 'bfav-002', name: 'IVG Bar Favourites — Fruit Twist', productnumber: '478', ivg_productline: 'IVG BAR FAVOURITES', ivg_flavour: 'Fruit Twist', ivg_nicstrength: '10mg', price: 3.99, ivg_vatrate: 20, ivg_portalvisible: true, image: '' },
];

// ─── Orders ───
export const MOCK_ORDERS: OrderDraft[] = [
  {
    ivg_orderdraftid: 'ord-001',
    ivg_orderdraftnumber: '#IVG-98442',
    ivg_orderdate: '2026-03-24',
    ivg_status: 'Shipped',
    ivg_totalgross: 2847.60,
    ivg_totalnetamount: 2373.00,
    ivg_vatamount: 474.60,
    ivg_ponumber: 'PO-DEV-2026-042',
    _ivg_account_value: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
    ivg_deliverydate: '2026-03-28',
  },
  {
    ivg_orderdraftid: 'ord-002',
    ivg_orderdraftnumber: '#IVG-98440',
    ivg_orderdate: '2026-03-23',
    ivg_status: 'Processing',
    ivg_totalgross: 1654.80,
    ivg_totalnetamount: 1379.00,
    ivg_vatamount: 275.80,
    ivg_ponumber: 'PO-DEV-2026-041',
    _ivg_account_value: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
  },
  {
    ivg_orderdraftid: 'ord-003',
    ivg_orderdraftnumber: '#IVG-98438',
    ivg_orderdate: '2026-03-21',
    ivg_status: 'Delivered',
    ivg_totalgross: 4512.00,
    ivg_totalnetamount: 3760.00,
    ivg_vatamount: 752.00,
    ivg_ponumber: 'PO-DEV-2026-039',
    _ivg_account_value: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
    ivg_deliverydate: '2026-03-25',
  },
  {
    ivg_orderdraftid: 'ord-004',
    ivg_orderdraftnumber: '#IVG-98435',
    ivg_orderdate: '2026-03-18',
    ivg_status: 'Delivered',
    ivg_totalgross: 3245.40,
    ivg_totalnetamount: 2704.50,
    ivg_vatamount: 540.90,
    ivg_ponumber: 'PO-DEV-2026-037',
    _ivg_account_value: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
    ivg_deliverydate: '2026-03-22',
  },
  {
    ivg_orderdraftid: 'ord-005',
    ivg_orderdraftnumber: '#IVG-98430',
    ivg_orderdate: '2026-03-14',
    ivg_status: 'Delivered',
    ivg_totalgross: 1890.00,
    ivg_totalnetamount: 1575.00,
    ivg_vatamount: 315.00,
    _ivg_account_value: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
    ivg_deliverydate: '2026-03-18',
  },
  {
    ivg_orderdraftid: 'ord-006',
    ivg_orderdraftnumber: '#IVG-98425',
    ivg_orderdate: '2026-03-10',
    ivg_status: 'Cancelled',
    ivg_totalgross: 756.00,
    ivg_totalnetamount: 630.00,
    ivg_vatamount: 126.00,
    ivg_customernotes: 'Cancelled — duplicate order',
    _ivg_account_value: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
  },
  {
    ivg_orderdraftid: 'ord-007',
    ivg_orderdraftnumber: '#IVG-98420',
    ivg_orderdate: '2026-03-05',
    ivg_status: 'Delivered',
    ivg_totalgross: 5670.00,
    ivg_totalnetamount: 4725.00,
    ivg_vatamount: 945.00,
    ivg_ponumber: 'PO-DEV-2026-032',
    _ivg_account_value: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
    ivg_deliverydate: '2026-03-09',
  },
  {
    ivg_orderdraftid: 'ord-008',
    ivg_orderdraftnumber: '#IVG-98410',
    ivg_orderdate: '2026-02-28',
    ivg_status: 'Delivered',
    ivg_totalgross: 2340.00,
    ivg_totalnetamount: 1950.00,
    ivg_vatamount: 390.00,
    ivg_ponumber: 'PO-DEV-2026-028',
    _ivg_account_value: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
    ivg_deliverydate: '2026-03-04',
  },
];

// ─── Order Lines (for order detail view) ───
export const MOCK_ORDER_LINES: Record<string, OrderDraftLine[]> = {
  'ord-001': [
    { ivg_orderdraftlineid: 'ol-001', ivg_productname: 'IVG 2400 — Berry Edition', ivg_quantity: 120, ivg_unitprice: 8.99, ivg_netamount: 1078.80, ivg_vatpercent: 20, ivg_vatamount: 215.76, ivg_grossamount: 1294.56, _ivg_product_value: 'p-005' },
    { ivg_orderdraftlineid: 'ol-002', ivg_productname: 'IVG Bar Plus — Blue Raspberry Ice', ivg_quantity: 200, ivg_unitprice: 4.50, ivg_netamount: 900.00, ivg_vatpercent: 20, ivg_vatamount: 180.00, ivg_grossamount: 1080.00, _ivg_product_value: 'p-001' },
    { ivg_orderdraftlineid: 'ol-003', ivg_productname: 'IVG Nic Salt — Spearmint', ivg_quantity: 50, ivg_unitprice: 3.99, ivg_netamount: 199.50, ivg_vatpercent: 20, ivg_vatamount: 39.90, ivg_grossamount: 239.40, _ivg_product_value: 'p-009' },
  ],
  'ord-002': [
    { ivg_orderdraftlineid: 'ol-004', ivg_productname: 'IVG 2400 — Juicy Edition', ivg_quantity: 80, ivg_unitprice: 8.99, ivg_netamount: 719.20, ivg_vatpercent: 20, ivg_vatamount: 143.84, ivg_grossamount: 863.04, _ivg_product_value: 'p-006' },
    { ivg_orderdraftlineid: 'ol-005', ivg_productname: 'IVG Bar Plus — Pink Lemonade', ivg_quantity: 100, ivg_unitprice: 4.50, ivg_netamount: 450.00, ivg_vatpercent: 20, ivg_vatamount: 90.00, ivg_grossamount: 540.00, _ivg_product_value: 'p-003' },
  ],
  'ord-003': [
    { ivg_orderdraftlineid: 'ol-006', ivg_productname: 'IVG 2400 — Menthol Edition', ivg_quantity: 200, ivg_unitprice: 8.99, ivg_netamount: 1798.00, ivg_vatpercent: 20, ivg_vatamount: 359.60, ivg_grossamount: 2157.60, _ivg_product_value: 'p-007' },
    { ivg_orderdraftlineid: 'ol-007', ivg_productname: 'IVG Shortfill — Summer Blaze 50ml', ivg_quantity: 100, ivg_unitprice: 9.99, ivg_netamount: 999.00, ivg_vatpercent: 20, ivg_vatamount: 199.80, ivg_grossamount: 1198.80, _ivg_product_value: 'p-013' },
    { ivg_orderdraftlineid: 'ol-008', ivg_productname: 'IVG Classics — Cola Ice', ivg_quantity: 80, ivg_unitprice: 5.49, ivg_netamount: 439.20, ivg_vatpercent: 20, ivg_vatamount: 87.84, ivg_grossamount: 527.04, _ivg_product_value: 'p-015' },
  ],
};

// ─── Support Tickets ───
export const MOCK_TICKETS: Incident[] = [
  {
    incidentid: 'inc-001',
    ticketnumber: '#CAS-1042',
    title: 'Stock discrepancies in North Hub',
    statuscode: 1, // Open
    statecode: 0,
    createdon: '2026-03-28',
    description: 'Reporting a variance of 45 units in the last bulk shipment received at the North distribution hub. Order #IVG-98438 showed 200 units of IVG 2400 Menthol Edition but only 155 were delivered.',
    casetypecode: 1, // Delivery Issue
  },
  {
    incidentid: 'inc-002',
    ticketnumber: '#CAS-1038',
    title: 'Billing cycle update request',
    statuscode: 2, // In Progress
    statecode: 0,
    createdon: '2026-03-25',
    description: 'Devsinc is requesting to move from Net 30 to Net 45 terms for the upcoming Q2 cycle. Please route to finance for approval.',
    casetypecode: 3, // Billing
  },
  {
    incidentid: 'inc-003',
    ticketnumber: '#CAS-1035',
    title: 'Product label compliance query — UAE market',
    statuscode: 5, // Resolved
    statecode: 1,
    createdon: '2026-03-20',
    description: 'Need confirmation that IVG Bar Plus labels comply with UAE ESMA regulations effective April 2026. Specifically around nicotine content display and health warning sizes.',
    casetypecode: 2, // Compliance
  },
  {
    incidentid: 'inc-004',
    ticketnumber: '#CAS-1030',
    title: 'Bulk pricing discrepancy on IVG 2400 range',
    statuscode: 5, // Resolved
    statecode: 1,
    createdon: '2026-03-15',
    description: 'Invoiced at standard rate £8.99/unit instead of Gold tier rate £7.49/unit for order #IVG-98430. Requesting credit note or adjustment.',
    casetypecode: 3, // Billing
  },
  {
    incidentid: 'inc-005',
    ticketnumber: '#CAS-1025',
    title: 'API integration — inventory sync failing',
    statuscode: 5, // Resolved
    statecode: 1,
    createdon: '2026-03-10',
    description: 'Our internal ERP system is failing to sync inventory levels via the B2B API. Getting 429 rate limit errors during peak hours.',
    casetypecode: 4, // Technical
  },
];

// ─── Helper: status label mapping ───
export function getTicketStatusLabel(statuscode: number): string {
  switch (statuscode) {
    case 1: return 'Open';
    case 2: return 'In Progress';
    case 3: return 'Waiting on Customer';
    case 5: return 'Resolved';
    case 6: return 'Cancelled';
    default: return 'Unknown';
  }
}

export function getTicketStatusClass(statuscode: number): string {
  switch (statuscode) {
    case 1: return 'open';
    case 2: return 'in-progress';
    case 3: return 'waiting';
    case 5: return 'resolved';
    case 6: return 'cancelled';
    default: return '';
  }
}

export function getTicketPriority(casetypecode?: number): string {
  switch (casetypecode) {
    case 1: return 'High';
    case 2: return 'Medium';
    case 3: return 'Medium';
    case 4: return 'Low';
    default: return 'Normal';
  }
}

export function getTicketCategory(casetypecode?: number): string {
  switch (casetypecode) {
    case 1: return 'Delivery Issue';
    case 2: return 'Compliance';
    case 3: return 'Billing';
    case 4: return 'Technical';
    default: return 'General';
  }
}

export function getOrderStatusClass(status: string): string {
  switch (status) {
    case 'Draft': return 'draft';
    case 'Submitted': return 'submitted';
    case 'Confirmed': return 'confirmed';
    case 'Processing': return 'processing';
    case 'Shipped': return 'shipped';
    case 'Delivered': return 'delivered';
    case 'Cancelled': return 'cancelled';
    default: return '';
  }
}

// ─── Analytics summary ───
export const MOCK_ANALYTICS = {
  totalOrders: 47,
  pendingApproval: 2,
  shippedToday: 1,
  totalSpend: 128450,
  q4Growth: 12.5,
  monthlyVolumes: [
    { month: 'Oct', value: 18200 },
    { month: 'Nov', value: 22400 },
    { month: 'Dec', value: 31600 },
    { month: 'Jan', value: 24800 },
    { month: 'Feb', value: 19500 },
    { month: 'Mar', value: 28400 },
  ],
};
