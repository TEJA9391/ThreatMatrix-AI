import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { History as HistoryIcon, ShieldAlert, ShieldCheck, AlertTriangle, AlertCircle, ChevronRight } from 'lucide-react';

const API = '/api';
const LABEL_ICON = { Fake: ShieldAlert, Misleading: AlertTriangle, 'Partially True': AlertCircle, Real: ShieldCheck };
const LABEL_COLOR = { Fake: 'var(--red)', Misleading: 'var(--purple)', 'Partially True': 'var(--amber)', Real: 'var(--green)' };

export default function History() {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]     = useState(0);
  const navigate            = useNavigate();
  const PER_PAGE = 15;

  useEffect(() => {
    axios.get(`${API}/history?limit=${PER_PAGE}&skip=${page * PER_PAGE}`)
      .then(r => { setItems(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [page]);

  if (loading) return <div style={{ color: 'var(--muted)', padding: '3rem', textAlign: 'center' }}>Loading history…</div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <HistoryIcon size={22} color="var(--neon)" />
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Detection History</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>All past analyses · stored in MongoDB</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)' }}>
          No history yet — run your first analysis on the Analyze page.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {items.map((item, i) => {
            const Icon  = LABEL_ICON[item.prediction]  || ShieldCheck;
            const color = LABEL_COLOR[item.prediction] || 'var(--green)';
            return (
              <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '1rem 1.25rem' }}
                onClick={() => navigate(`/history/${item.id}`)}
              >
                <div style={{ padding: '0.6rem', background: `${color}15`, borderRadius: '0.6rem', border: `1px solid ${color}30`, flexShrink: 0 }}>
                  <Icon size={16} color={color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.text?.slice(0, 100)}…
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{item.timestamp?.slice(0, 10)}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>
                      Lang: {item.language?.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: item.trust_score < 35 ? 'var(--red)' : item.trust_score < 65 ? 'var(--amber)' : 'var(--green)', fontWeight: 700 }}>
                    {item.trust_score}/100
                  </span>
                  <span className="badge" style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
                    {item.prediction}
                  </span>
                  <span className="badge" style={{
                    background: item.risk_level === 'High' ? 'rgba(255,49,49,0.12)' : item.risk_level === 'Medium' ? 'rgba(251,191,36,0.12)' : 'rgba(57,255,20,0.10)',
                    color: item.risk_level === 'High' ? 'var(--red)' : item.risk_level === 'Medium' ? 'var(--amber)' : 'var(--green)',
                  }}>{item.risk_level}</span>
                  <ChevronRight size={14} color="var(--muted)" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
        <button className="btn-ghost" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
        <span style={{ color: 'var(--muted)', fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}>Page {page + 1}</span>
        <button className="btn-ghost" disabled={items.length < PER_PAGE} onClick={() => setPage(p => p + 1)}>Next →</button>
      </div>
    </div>
  );
}
