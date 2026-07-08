import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Search, AlertTriangle, CheckCircle2, AlertCircle,
  Globe, Zap, FileText, Tag, BarChart2, ExternalLink,
  Info, ShieldAlert, ShieldCheck, Languages, XCircle, Copy
} from 'lucide-react';

const API = '/api';

const LABEL_STYLES = {
  'Fake':          { cls: 'badge-fake',    glow: 'card-glow-red',   color: 'var(--red)',    icon: ShieldAlert },
  'Misleading':    { cls: 'badge-mislead', glow: 'card-glow-amber', color: 'var(--purple)', icon: AlertTriangle },
  'Partially True':{ cls: 'badge-partial', glow: 'card-glow-amber', color: 'var(--amber)',  icon: AlertCircle },
  'Real':          { cls: 'badge-real',    glow: 'card-glow-green', color: 'var(--green)',  icon: ShieldCheck },
};

const RISK_STYLES = {
  High:   { cls: 'badge-high',   color: 'var(--red)' },
  Medium: { cls: 'badge-medium', color: 'var(--amber)' },
  Low:    { cls: 'badge-low',    color: 'var(--green)' },
};

const EXAMPLES = [
  'Scientists at Indian Space Research Organisation discovered a hidden planet behind the Moon that will become visible to Earth next month.',
  'According to a peer-reviewed study published in The Lancet, regular physical activity reduces the risk of cardiovascular disease by up to 35%.',
  'The government has SECRETLY been putting fluoride in water to CONTROL the population! Mainstream media is HIDING this! SHARE before they delete this!',
];

export default function Analysis() {
  const [text, setText]     = useState('');
  const [lang, setLang]     = useState('');
  const [result, setResult] = useState(null);
  const [error, setError]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!text.trim() || text.trim().length < 20) return;
    setLoading(true); setResult(null); setError(null);
    try {
      const { data } = await axios.post(`${API}/analyze`, {
        text: text.trim(),
        language: lang || undefined,
      });
      setResult(data);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Backend unreachable. Start the FastAPI server on port 8000.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const ls = result ? LABEL_STYLES[result.prediction] || LABEL_STYLES['Real'] : null;
  const rs = result ? RISK_STYLES[result.risk_level]  || RISK_STYLES['Low']   : null;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: '4rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ padding: '0.6rem', background: 'rgba(0,243,255,0.08)', borderRadius: '0.75rem', border: '1px solid rgba(0,243,255,0.2)' }}>
            <Brain size={22} color="var(--neon)" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', letterSpacing: '-0.03em' }}>
              AI Fact Analyzer
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
              RoBERTa · Google Fact Check · NewsAPI · Wikipedia · Semantic Similarity
            </p>
          </div>
        </div>
      </div>

      {/* Input panel + examples */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <form onSubmit={handleAnalyze}>
            <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={12} /> Article / Headline / Post
              </label>
              <select
                value={lang}
                onChange={e => setLang(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--muted)', padding: '0.3rem 0.6rem', fontSize: '0.72rem', fontFamily: 'var(--font)', cursor: 'pointer' }}
              >
                <option value="">Auto-detect language</option>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="te">Telugu</option>
              </select>
            </div>
            <textarea
              className="tm-textarea"
              rows={7}
              placeholder="Paste a news headline, full article, or social media post to verify…"
              value={text}
              onChange={e => setText(e.target.value)}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
              <span style={{ fontSize: '0.72rem', color: text.length < 20 ? 'var(--red)' : 'var(--muted)' }}>
                {text.length} chars {text.length < 20 ? '(min 20)' : '✓'}
              </span>
              <button type="submit" className="btn-primary" disabled={loading || text.trim().length < 20}>
                {loading ? <div className="spinner" /> : <Search size={15} />}
                {loading ? 'Analyzing…' : 'Analyze Content'}
              </button>
            </div>
          </form>
        </div>

        {/* Examples */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Zap size={12} /> Quick Examples
          </label>
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => setText(ex)}
              style={{ textAlign: 'left', padding: '0.65rem 0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '0.75rem', color: 'var(--muted)', fontSize: '0.75rem', cursor: 'pointer', lineHeight: 1.5, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.target.style.borderColor = 'rgba(0,243,255,0.3)'; e.target.style.color = 'var(--text)'; }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--muted)'; }}
            >
              {ex.slice(0, 90)}…
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="card" style={{ borderColor: 'rgba(255,49,49,0.3)', background: 'rgba(255,49,49,0.05)', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <XCircle size={24} color="var(--red)" />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--red)', fontSize: '0.9rem' }}>Analysis Failed</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>{error}</div>
          </div>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Verdict banner */}
            <div className={`card ${ls.glow}`} style={{ borderWidth: 2 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.9rem', background: `${ls.color}18`, borderRadius: '1rem', border: `1px solid ${ls.color}40` }}>
                    <ls.icon size={28} color={ls.color} />
                  </div>
                  <div>
                    <div className="label" style={{ marginBottom: '0.3rem' }}>AI Verdict</div>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: ls.color, letterSpacing: '-0.04em', lineHeight: 1 }}>
                      {result.prediction.toUpperCase()}
                    </h2>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      <span className={`badge ${rs.cls}`}>Risk: {result.risk_level}</span>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
                        <Languages size={10} /> {result.language?.toUpperCase()}
                      </span>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
                        {result.processing_time_ms}ms
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score trio */}
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Fake Probability', val: `${(result.fake_probability*100).toFixed(1)}%`, color: result.fake_probability > 0.6 ? 'var(--red)' : result.fake_probability > 0.35 ? 'var(--amber)' : 'var(--green)' },
                    { label: 'Confidence',        val: `${(result.confidence*100).toFixed(1)}%`,       color: 'var(--neon)' },
                    { label: 'Trust Score',       val: `${result.trust_score}/100`,                    color: result.trust_score < 35 ? 'var(--red)' : result.trust_score < 65 ? 'var(--amber)' : 'var(--green)' },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                      <div className="label" style={{ marginBottom: '0.3rem' }}>{s.label}</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: s.color, fontFamily: 'var(--mono)' }}>{s.val}</div>
                    </div>
                  ))}
                </div>

                <button className="btn-ghost" onClick={handleCopy} style={{ fontSize: '0.7rem' }}>
                  <Copy size={12} /> {copied ? 'Copied!' : 'Export JSON'}
                </button>
              </div>

              {/* Progress bars */}
              <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                {[
                  { label: 'Fake Probability', pct: result.fake_probability*100, color: result.fake_probability > 0.6 ? 'var(--red)' : 'var(--amber)' },
                  { label: 'Confidence',        pct: result.confidence*100,       color: 'var(--neon)' },
                  { label: 'Trust Score',       pct: result.trust_score,          color: result.trust_score < 35 ? 'var(--red)' : 'var(--green)' },
                ].map(b => (
                  <div key={b.label}>
                    <div className="progress-track">
                      <motion.div className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${b.pct}%` }}
                        style={{ background: b.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3-column grid: Entities | Keywords | Sentiment */}
            <div className="grid-3">
              {/* Named Entities */}
              <div className="card">
                <div className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                  <Tag size={12} /> Named Entities (NER)
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {result.entities?.slice(0, 10).map((e, i) => (
                    <span key={i} className="chip" title={e.description}>
                      {e.text}
                      <span style={{ fontSize: '0.6rem', color: 'var(--neon)', fontWeight: 700 }}>{e.label}</span>
                    </span>
                  ))}
                  {!result.entities?.length && <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>No entities detected</span>}
                </div>
              </div>

              {/* Keywords */}
              <div className="card">
                <div className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                  <Brain size={12} /> Key Phrases (Influencers)
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {result.keywords?.map((kw, i) => (
                    <span key={i} className="chip" style={{ color: 'var(--neon)', borderColor: 'rgba(0,243,255,0.2)' }}>{kw}</span>
                  ))}
                </div>
              </div>

              {/* Sentiment */}
              <div className="card">
                <div className="label" style={{ marginBottom: '0.75rem' }}>Sentiment Analysis</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: result.sentiment === 'POSITIVE' ? 'var(--green)' : 'var(--red)', marginBottom: '0.5rem' }}>
                  {result.sentiment}
                </div>
                <div className="progress-track" style={{ marginBottom: '0.4rem' }}>
                  <motion.div className="progress-fill" initial={{ width: 0 }}
                    animate={{ width: `${result.sentiment_score*100}%` }}
                    style={{ background: result.sentiment === 'POSITIVE' ? 'var(--green)' : 'var(--red)' }}
                  />
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{(result.sentiment_score*100).toFixed(1)}% confidence</span>
                <div style={{ marginTop: '1rem' }}>
                  <div className="label" style={{ marginBottom: '0.4rem' }}>Extracted Claims</div>
                  {result.claims?.map((c, i) => (
                    <div key={i} style={{ fontSize: '0.75rem', color: 'var(--muted)', padding: '0.4rem 0.6rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', marginBottom: '0.3rem', lineHeight: 1.5, borderLeft: '2px solid rgba(0,243,255,0.3)' }}>
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Fact Checks */}
            {result.fact_checks?.length > 0 && (
              <div className="card">
                <div className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                  <CheckCircle2 size={12} color="var(--green)" /> Google Fact Check Results ({result.fact_checks.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {result.fact_checks.map((fc, i) => (
                    <div key={i} style={{ padding: '0.9rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px solid var(--border)', display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 600, marginBottom: '0.25rem' }}>{fc.claim}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Claimant: {fc.claimant} · {fc.publisher} · {fc.date}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="badge" style={{
                          background: fc.verdict.toLowerCase().includes('false') ? 'rgba(255,49,49,0.15)' : fc.verdict.toLowerCase().includes('true') ? 'rgba(57,255,20,0.12)' : 'rgba(251,191,36,0.12)',
                          color: fc.verdict.toLowerCase().includes('false') ? 'var(--red)' : fc.verdict.toLowerCase().includes('true') ? 'var(--green)' : 'var(--amber)',
                          border: '1px solid currentColor'
                        }}>{fc.verdict}</span>
                        {fc.url && <a href={fc.url} target="_blank" rel="noreferrer" style={{ color: 'var(--neon)' }}><ExternalLink size={13} /></a>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Articles */}
            {result.related_articles?.length > 0 && (
              <div className="card">
                <div className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                  <Globe size={12} /> Related Trusted Articles · Source Credibility
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '0.75rem' }}>
                  {result.related_articles.map((art, i) => (
                    <div key={i} style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{art.source}</span>
                        <span className="badge" style={{
                          background: art.credibility?.rating === 'High' ? 'rgba(57,255,20,0.1)' : art.credibility?.rating === 'Low' ? 'rgba(255,49,49,0.1)' : 'rgba(251,191,36,0.1)',
                          color: art.credibility?.rating === 'High' ? 'var(--green)' : art.credibility?.rating === 'Low' ? 'var(--red)' : 'var(--amber)',
                        }}>{art.credibility?.rating}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 600, lineHeight: 1.4, marginBottom: '0.3rem' }}>{art.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted)', lineHeight: 1.5 }}>{art.description?.slice(0, 100)}…</div>
                      <a href={art.url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--neon)' }}>
                        Read <ExternalLink size={11} />
                      </a>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BarChart2 size={13} color="var(--neon)" />
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                    Semantic similarity with trusted sources: <span style={{ color: 'var(--neon)', fontWeight: 700 }}>{(result.semantic_similarity*100).toFixed(0)}%</span>
                    {result.semantic_similarity < 0.3 ? ' — Low overlap may indicate fabricated content' : ' — Good alignment with known reporting'}
                  </span>
                </div>
              </div>
            )}

            {/* Explainability */}
            <div className="card">
              <div className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                <Info size={12} /> Explainable AI — Why this verdict?
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {Object.entries(result.explanation || {}).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: '1rem', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.6rem', border: '1px solid var(--border)' }}>
                    <div style={{ width: 3, flexShrink: 0, borderRadius: 9999, background: 'rgba(0,243,255,0.4)' }} />
                    <div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--neon)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>
                        {k.replace(/_/g, ' ')}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                        {Array.isArray(v) ? v.join(', ') : String(v)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wiki context */}
            {result.wiki_context?.length > 0 && (
              <div className="card">
                <div className="label" style={{ marginBottom: '0.75rem' }}>Wikipedia Ground Truth Context</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '0.75rem' }}>
                  {result.wiki_context.map((w, i) => (
                    <div key={i} style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
                      <div style={{ fontWeight: 700, color: 'var(--neon)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>{w.entity}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.5 }}>{w.summary?.slice(0, 180)}…</div>
                      <a href={w.url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.4rem', fontSize: '0.7rem', color: 'var(--neon)' }}>
                        Wikipedia <ExternalLink size={10} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
