import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { BarChart2, ShieldAlert, ShieldCheck, AlertTriangle, AlertCircle, TrendingUp } from 'lucide-react';

const API = '/api';
const COLORS = { Fake: '#ff3131', Real: '#39ff14', Misleading: '#bc13fe', 'Partially True': '#fbbf24' };

export default function Dashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/stats`).then(r => { setStats(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: 'var(--muted)', padding: '3rem', textAlign: 'center' }}>Loading analytics…</div>;
  if (!stats)  return <div style={{ color: 'var(--muted)', padding: '3rem', textAlign: 'center' }}>No data yet — run your first analysis.</div>;

  const c = stats.counts || {};
  const pieData = [
    { name: 'Fake',          value: c.fake || 0 },
    { name: 'Misleading',    value: c.misleading || 0 },
    { name: 'Partially True',value: c.partially_true || 0 },
    { name: 'Real',          value: c.real || 0 },
  ].filter(d => d.value > 0);

  const riskData = [
    { name: 'High',   value: c.high_risk   || 0, fill: '#ff3131' },
    { name: 'Medium', value: c.medium_risk || 0, fill: '#fbbf24' },
    { name: 'Low',    value: c.low_risk    || 0, fill: '#39ff14' },
  ];

  const STAT_CARDS = [
    { label: 'Total Analyzed', val: c.total || 0,           icon: BarChart2,    color: 'var(--neon)' },
    { label: 'Fake Detected',  val: c.fake || 0,            icon: ShieldAlert,  color: 'var(--red)' },
    { label: 'Real Content',   val: c.real || 0,            icon: ShieldCheck,  color: 'var(--green)' },
    { label: 'Misleading',     val: c.misleading || 0,      icon: AlertTriangle, color: 'var(--purple)' },
    { label: 'Partially True', val: c.partially_true || 0,  icon: AlertCircle,  color: 'var(--amber)' },
    { label: 'High Risk',      val: c.high_risk || 0,       icon: TrendingUp,   color: 'var(--red)' },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Analytics Dashboard</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.3rem' }}>Detection stats from MongoDB · Real-time</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {STAT_CARDS.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', background: `${s.color}15`, borderRadius: '0.75rem', border: `1px solid ${s.color}30` }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div>
              <div className="label">{s.label}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: s.color, fontFamily: 'var(--mono)', lineHeight: 1.1 }}>{s.val}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* Pie */}
        <div className="card">
          <div className="label" style={{ marginBottom: '1rem' }}>Prediction Distribution</div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, idx) => <Cell key={idx} fill={COLORS[entry.name] || '#64748b'} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--text)', fontSize: '0.75rem' }} />
                <Legend formatter={v => <span style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '3rem' }}>No data yet</div>}
        </div>

        {/* Risk bar */}
        <div className="card">
          <div className="label" style={{ marginBottom: '1rem' }}>Risk Level Breakdown</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={riskData} barCategoryGap="30%">
              <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--text)', fontSize: '0.75rem' }} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {riskData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend line */}
      {stats.trend?.length > 0 && (
        <div className="card">
          <div className="label" style={{ marginBottom: '1rem' }}>7-Day Detection Trend</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats.trend}>
              <XAxis dataKey="date" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--text)', fontSize: '0.75rem' }} />
              <Legend formatter={v => <span style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>{v}</span>} />
              <Line type="monotone" dataKey="total" stroke="var(--neon)" strokeWidth={2} dot={false} name="Total" />
              <Line type="monotone" dataKey="fake"  stroke="var(--red)"  strokeWidth={2} dot={false} name="Fake" />
              <Line type="monotone" dataKey="real"  stroke="var(--green)"strokeWidth={2} dot={false} name="Real" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
