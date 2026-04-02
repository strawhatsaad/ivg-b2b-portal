'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getTicketStatusLabel, getTicketStatusClass, getTicketPriority, getTicketCategory } from '@/lib/mock-db';
import { getTicketById, getReplies, addReply } from '@/lib/mock-store';
import type { Reply } from '@/lib/mock-store';

export default function SupportDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [newReply, setNewReply] = useState('');
  const [replies, setReplies] = useState<Reply[]>([]);
  const [sending, setSending] = useState(false);

  const ticket = id ? getTicketById(id as string) : undefined;

  const loadReplies = useCallback(() => {
    if (id) {
      setReplies(getReplies(id as string));
    }
  }, [id]);

  useEffect(() => {
    loadReplies();
  }, [loadReplies]);

  const handleSendReply = async () => {
    if (!newReply.trim() || !id) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 600));
    addReply(id as string, newReply.trim());
    setNewReply('');
    loadReplies();
    setSending(false);
  };

  if (!ticket) {
    return (
      <div className="portal-page" style={{ padding: 60, textAlign: 'center' }}>
        <h2>Case not found</h2>
        <Link href="/support" className="ivg-btn ivg-btn--secondary" style={{ marginTop: 24 }}>Back to Support</Link>
      </div>
    );
  }

  return (
    <div className="portal-page">
      <header className="page-header">
        <div>
          <Link href="/support" className="back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            Back to Support
          </Link>
          <h1>{ticket.title}</h1>
          <p className="text-secondary">
            {ticket.ticketnumber} &middot; {getTicketCategory(ticket.casetypecode)} &middot; Opened {new Date(ticket.createdon).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <span className={`status-pill status-pill--${getTicketStatusClass(ticket.statuscode)} status-pill--lg`}>
          {getTicketStatusLabel(ticket.statuscode)}
        </span>
      </header>

      {/* Case Details */}
      <div className="case-meta">
        <div className="case-meta-item">
          <span className="detail-label">Priority</span>
          <span className={`priority-dot priority-dot--${getTicketPriority(ticket.casetypecode).toLowerCase()}`}>
            {getTicketPriority(ticket.casetypecode)}
          </span>
        </div>
        <div className="case-meta-item">
          <span className="detail-label">Category</span>
          <span>{getTicketCategory(ticket.casetypecode)}</span>
        </div>
        <div className="case-meta-item">
          <span className="detail-label">Status</span>
          <span>{getTicketStatusLabel(ticket.statuscode)}</span>
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="conversation-thread">
        <h3 className="table-card-title">Conversation</h3>
        <div className="thread-messages">
          {replies.map(reply => (
            <div key={reply.id} className={`thread-message${reply.role === 'Customer' ? ' thread-message--self' : ''}`}>
              <div className="thread-message-header">
                <div className="thread-avatar">
                  {reply.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <strong>{reply.author}</strong>
                  <span className="text-secondary" style={{ fontSize: 12, marginLeft: 8 }}>{reply.role}</span>
                </div>
                <span className="text-secondary" style={{ marginLeft: 'auto', fontSize: 12 }}>
                  {new Date(reply.date).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="thread-message-body">{reply.message}</p>
            </div>
          ))}
          {replies.length === 0 && (
            <p className="text-secondary" style={{ padding: 24, textAlign: 'center' }}>No messages yet.</p>
          )}
        </div>

        {/* Reply Box */}
        {ticket.statecode === 0 && (
          <div className="reply-box">
            <textarea
              className="ivg-input"
              rows={4}
              placeholder="Type your reply..."
              value={newReply}
              onChange={e => setNewReply(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button
                className="ivg-btn ivg-btn--primary"
                disabled={!newReply.trim() || sending}
                onClick={handleSendReply}
              >
                {sending ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
