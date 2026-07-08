import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Brain, LayoutDashboard, History, TrendingUp,
  Shield, Activity, Zap
} from 'lucide-react';

const NAV = [
  { to: '/',          label: 'Analyze',   icon: Brain },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/history',   label: 'History',   icon: History },
  { to: '/trending',  label: 'Trending',  icon: TrendingUp },
];

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Logo */}
        <div style={{ marginBottom: '2rem', paddingLeft: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <div style={{ width: 32, height: 32, background: 'rgba(0,243,255,0.1)', borderRadius: '0.6rem', border: '1px solid rgba(0,243,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={16} color="var(--neon)" />
            </div>
            <span style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--neon)', letterSpacing: '-0.02em' }}>ThreatMatrix</span>
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', paddingLeft: '2.6rem' }}>AI News Guard</span>
        </div>

        {/* Live indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.9rem', background: 'rgba(57,255,20,0.06)', borderRadius: '0.6rem', marginBottom: '1.5rem', border: '1px solid rgba(57,255,20,0.15)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)', animation: 'spin 2s linear infinite' }} />
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--green)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>AI Engine Active</span>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to} to={to} end={to === '/'}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem' }}>
            <Activity size={13} color="var(--muted)" />
            <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>v2.0.0 — RoBERTa</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Zap size={16} color="var(--neon)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--muted)' }}>
              Powered by <span style={{ color: 'var(--neon)' }}>RoBERTa</span> + Google Fact Check + NewsAPI
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', background: 'rgba(0,243,255,0.06)', borderRadius: '9999px', border: '1px solid rgba(0,243,255,0.2)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--neon)', boxShadow: '0 0 6px var(--neon)' }} />
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--neon)', letterSpacing: '0.08em' }}>BACKEND LIVE</span>
          </div>
        </header>

        {/* Page content */}
        <main className="page" style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
