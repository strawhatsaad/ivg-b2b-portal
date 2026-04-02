'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { getTicketStatusLabel, getTicketStatusClass, getTicketPriority, getTicketCategory } from '@/lib/mock-db';
import { useTickets } from '@/hooks/useTickets';

export default function SupportPage() {
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const { tickets: allTickets, loading } = useTickets();
  const openCount = allTickets.filter(t => t.statecode === 0).length;
  const resolvedCount = allTickets.filter(t => t.statecode === 1).length;

  const filtered = filter === 'all'
    ? allTickets
    : filter === 'open'
    ? allTickets.filter(t => t.statecode === 0)
    : allTickets.filter(t => t.statecode === 1);

  return (
    <div className="portal-page">
      <header className="page-header">
        <div>
          <h1>Support Center</h1>
          <p className="text-secondary">Enterprise-grade assistance and technical oversight for your distribution workflows.</p>
        </div>
        <Link href="/support/new" className="ivg-btn ivg-btn--primary">
          Create New Case
        </Link>
      </header>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-label">Total Tickets</span>
          <span className="stat-value">{allTickets.length}</span>
        </div>
        <div className="stat-card stat-card--alert">
          <span className="stat-label">Open Issues</span>
          <span className="stat-value">{openCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg. Response Time</span>
          <span className="stat-value">1.4h</span>
        </div>
      </div>

      {/* Filter */}
      <div className="filter-bar">
        <div className="filter-pills">
          <button className={`filter-pill${filter === 'all' ? ' filter-pill--active' : ''}`} onClick={() => setFilter('all')}>All ({allTickets.length})</button>
          <button className={`filter-pill${filter === 'open' ? ' filter-pill--active' : ''}`} onClick={() => setFilter('open')}>Open ({openCount})</button>
          <button className={`filter-pill${filter === 'resolved' ? ' filter-pill--active' : ''}`} onClick={() => setFilter('resolved')}>Resolved ({resolvedCount})</button>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="table-card">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Case ID</th>
              <th>Subject</th>
              <th>Category</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Date Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(ticket => (
              <tr key={ticket.incidentid}>
                <td>
                  <Link href={`/support/${ticket.incidentid}`} className="order-link">
                    <strong>{ticket.ticketnumber}</strong>
                  </Link>
                </td>
                <td>
                  <div>
                    <strong>{ticket.title}</strong>
                    <p className="text-secondary" style={{ fontSize: 12, marginTop: 2 }}>
                      {ticket.description?.slice(0, 60)}...
                    </p>
                  </div>
                </td>
                <td className="text-secondary">{getTicketCategory(ticket.casetypecode)}</td>
                <td>
                  <span className={`status-pill status-pill--${getTicketStatusClass(ticket.statuscode)}`}>
                    {getTicketStatusLabel(ticket.statuscode)}
                  </span>
                </td>
                <td>
                  <span className={`priority-dot priority-dot--${getTicketPriority(ticket.casetypecode).toLowerCase()}`}>
                    {getTicketPriority(ticket.casetypecode)}
                  </span>
                </td>
                <td className="text-secondary">
                  {new Date(ticket.createdon).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
