import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { TrendingUp, ShieldAlert, Globe, ExternalLink, RefreshCw } from 'lucide-react';

const API = '/api';

export default function Trending() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTrending = () => {
    setLoading(true);
    axios.get(`${API}/trending`)
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchTrending(); }, []);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <TrendingUp size={22} color="var(--red)" />
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Trending Misinformation</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Live fake news feed · NewsAPI · High-risk detections</p>
          </div>
        </div>
        <button className="btn-ghost" onClick={fetchTrending} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {loading && <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '3rem' }}>Fetching live feed…</div>}

      {!loading && data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* High-risk from DB */}
          {data.from_db?.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <ShieldAlert size={14} color="var(--red)" />
                <span className="label" style={{ color: 'var(--red)' }}>High-Risk Detections (from your history)</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {data.from_db.map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="card" style={{ borderColor: 'rgba(255,49,49,0.2)', background: 'rgba(255,49,49,0.03)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <ShieldAlert size={18} color="var(--red)" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.text?.slice(0, 120)}…
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                        {item.timestamp?.slice(0, 10)} · Trust: {item.trust_score}/100
                      </div>
                    </div>
                    <span className="badge badge-fake">{item.prediction}</span>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Live NewsAPI feed */}
          {data.live_feed?.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Globe size={14} color="var(--neon)" />
                <span className="label" style={{ color: 'var(--neon)' }}>Live Fact-Check News Feed (NewsAPI)</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1rem' }}>
                {data.live_feed.map((art, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{art.source}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>{art.publishedAt}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text)', fontWeight: 600, lineHeight: 1.4 }}>{art.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.5 }}>{art.description?.slice(0, 100)}…</div>
                    <a href={art.url} target="_blank" rel="noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: 'var(--neon)', marginTop: 'auto', paddingTop: '0.5rem' }}>
                      Read article <ExternalLink size={11} />
                    </a>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {!data.from_db?.length && !data.live_feed?.length && (
            <div className="card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)' }}>
              No trending data available. Add a NewsAPI key to see live feed.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
