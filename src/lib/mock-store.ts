/**
 * Mutable Mock Store — localStorage-backed CRUD for demo
 * Reads seed data from mock-db on first load, persists mutations.
 */

import { OrderDraft, OrderDraftLine, Incident } from './types';
import {
  MOCK_ORDERS as SEED_ORDERS,
  MOCK_ORDER_LINES as SEED_LINES,
  MOCK_TICKETS as SEED_TICKETS,
} from './mock-db';

const STORE_KEYS = {
  orders: 'ivg_store_orders',
  orderLines: 'ivg_store_order_lines',
  tickets: 'ivg_store_tickets',
  replies: 'ivg_store_replies',
  orderCounter: 'ivg_store_order_counter',
  ticketCounter: 'ivg_store_ticket_counter',
};

export interface Reply {
  id: string;
  author: string;
  role: string;
  date: string;
  message: string;
}

const SEED_REPLIES: Record<string, Reply[]> = {
  'inc-001': [
    { id: 'r1', author: 'Saad Anjum', role: 'Customer', date: '2026-03-28T14:30:00', message: 'We received the shipment for order #IVG-98438 but the count is off. 200 units ordered of IVG 2400 Menthol Edition, only 155 delivered. Please investigate.' },
    { id: 'r2', author: 'Emma Richardson', role: 'IVG Support', date: '2026-03-28T16:45:00', message: 'Hi Saad, thank you for reporting this. I\'ve escalated this to our warehouse team at the North Hub. We\'ll have an update for you within 24 hours. In the meantime, could you confirm whether the packaging showed any signs of damage?' },
  ],
  'inc-002': [
    { id: 'r3', author: 'Saad Anjum', role: 'Customer', date: '2026-03-25T10:00:00', message: 'We\'d like to request a change from Net 30 to Net 45 payment terms starting Q2 2026. Our account has maintained perfect payment history over the last 12 months.' },
    { id: 'r4', author: 'James Parker', role: 'IVG Finance', date: '2026-03-26T09:15:00', message: 'Hi Saad, I\'ve reviewed your request and your payment history is indeed excellent. I\'m routing this to our credit committee for final approval. Expected turnaround is 3-5 business days.' },
  ],
};

// ─── Helpers ───

function load<T>(key: string, seed: T): T {
  if (typeof window === 'undefined') return seed;
  const raw = localStorage.getItem(key);
  if (raw) {
    try { return JSON.parse(raw) as T; } catch { /* fall through */ }
  }
  localStorage.setItem(key, JSON.stringify(seed));
  return seed;
}

function save(key: string, data: unknown): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Orders ───

export function getOrders(): OrderDraft[] {
  return load(STORE_KEYS.orders, SEED_ORDERS);
}

export function getOrderById(id: string): OrderDraft | undefined {
  return getOrders().find(o => o.ivg_orderdraftid === id);
}

export function getOrderLines(orderId: string): OrderDraftLine[] {
  const all = load<Record<string, OrderDraftLine[]>>(STORE_KEYS.orderLines, SEED_LINES);
  return all[orderId] || [];
}

let _orderCounter: number | null = null;
function nextOrderNumber(): { id: string; number: string } {
  if (_orderCounter === null) {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORE_KEYS.orderCounter) : null;
    _orderCounter = stored ? parseInt(stored) : 98442;
  }
  _orderCounter++;
  if (typeof window !== 'undefined') localStorage.setItem(STORE_KEYS.orderCounter, String(_orderCounter));
  return {
    id: `ord-${_orderCounter}`,
    number: `#IVG-${_orderCounter}`,
  };
}

export interface CreateOrderInput {
  lines: { productId: string; productName: string; quantity: number; unitPrice: number; vatRate: number }[];
  poNumber?: string;
  notes?: string;
}

export function createOrder(input: CreateOrderInput): OrderDraft {
  const { id, number } = nextOrderNumber();
  let totalNet = 0;
  let totalVat = 0;

  const orderLines: OrderDraftLine[] = input.lines.map((line, i) => {
    const net = line.quantity * line.unitPrice;
    const vat = net * (line.vatRate / 100);
    totalNet += net;
    totalVat += vat;
    return {
      ivg_orderdraftlineid: `ol-${id}-${i}`,
      ivg_productname: line.productName,
      ivg_quantity: line.quantity,
      ivg_unitprice: line.unitPrice,
      ivg_netamount: net,
      ivg_vatpercent: line.vatRate,
      ivg_vatamount: vat,
      ivg_grossamount: net + vat,
      _ivg_product_value: line.productId,
    };
  });

  const order: OrderDraft = {
    ivg_orderdraftid: id,
    ivg_orderdraftnumber: number,
    ivg_orderdate: new Date().toISOString().split('T')[0],
    ivg_status: 'Submitted',
    ivg_totalgross: totalNet + totalVat,
    ivg_totalnetamount: totalNet,
    ivg_vatamount: totalVat,
    ivg_ponumber: input.poNumber || undefined,
    ivg_customernotes: input.notes || undefined,
    _ivg_account_value: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
  };

  // Persist
  const orders = getOrders();
  orders.unshift(order);
  save(STORE_KEYS.orders, orders);

  const allLines = load<Record<string, OrderDraftLine[]>>(STORE_KEYS.orderLines, SEED_LINES);
  allLines[id] = orderLines;
  save(STORE_KEYS.orderLines, allLines);

  return order;
}

// ─── Tickets ───

export function getTickets(): Incident[] {
  return load(STORE_KEYS.tickets, SEED_TICKETS);
}

export function getTicketById(id: string): Incident | undefined {
  return getTickets().find(t => t.incidentid === id);
}

let _ticketCounter: number | null = null;
function nextTicketNumber(): { id: string; number: string } {
  if (_ticketCounter === null) {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORE_KEYS.ticketCounter) : null;
    _ticketCounter = stored ? parseInt(stored) : 1042;
  }
  _ticketCounter++;
  if (typeof window !== 'undefined') localStorage.setItem(STORE_KEYS.ticketCounter, String(_ticketCounter));
  return {
    id: `inc-${_ticketCounter}`,
    number: `#CAS-${_ticketCounter}`,
  };
}

const CATEGORY_MAP: Record<string, number> = {
  delivery: 1,
  compliance: 2,
  billing: 3,
  technical: 4,
  general: 0,
};

export interface CreateTicketInput {
  title: string;
  category: string;
  priority: string;
  description: string;
  orderRef?: string;
}

export function createTicket(input: CreateTicketInput): Incident {
  const { id, number } = nextTicketNumber();
  const ticket: Incident = {
    incidentid: id,
    ticketnumber: number,
    title: input.title,
    statuscode: 1, // Open
    statecode: 0,
    createdon: new Date().toISOString().split('T')[0],
    description: input.description + (input.orderRef ? `\n\nRelated Order: ${input.orderRef}` : ''),
    casetypecode: CATEGORY_MAP[input.category] ?? 0,
  };

  const tickets = getTickets();
  tickets.unshift(ticket);
  save(STORE_KEYS.tickets, tickets);

  // Add initial message as a reply
  const replies = getReplies(id);
  replies.push({
    id: `r-${Date.now()}`,
    author: 'Saad Anjum',
    role: 'Customer',
    date: new Date().toISOString(),
    message: input.description,
  });
  const allReplies = load<Record<string, Reply[]>>(STORE_KEYS.replies, SEED_REPLIES);
  allReplies[id] = replies;
  save(STORE_KEYS.replies, allReplies);

  return ticket;
}

// ─── Replies ───

export function getReplies(ticketId: string): Reply[] {
  const all = load<Record<string, Reply[]>>(STORE_KEYS.replies, SEED_REPLIES);
  return all[ticketId] || [];
}

export function addReply(ticketId: string, message: string): Reply {
  const reply: Reply = {
    id: `r-${Date.now()}`,
    author: 'Saad Anjum',
    role: 'Customer',
    date: new Date().toISOString(),
    message,
  };

  const allReplies = load<Record<string, Reply[]>>(STORE_KEYS.replies, SEED_REPLIES);
  if (!allReplies[ticketId]) allReplies[ticketId] = [];
  allReplies[ticketId].push(reply);
  save(STORE_KEYS.replies, allReplies);

  return reply;
}
