import React, { useState } from 'react';
import axios from 'axios';
import {
  Eye, Search, ShieldOff, ShieldCheck, AlertTriangle,
  Globe, Lock, Database, User, Mail, Key, XCircle,
  Activity, ChevronRight, Hash, Clock, Zap, ListFilter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE } from '../config';

const SCAN_STEPS = [
  'Routing through Tor exit node...',
  'Querying breach index databases...',
  'Cross-referencing dark web paste sites...',
  'Scanning credential markets...',
  'Analyzing exposure surface...',
  'Compiling threat intelligence report...',
];

export default function DarkWebMonitor() {
  const [query, setQuery] = useState('');
  const [queryType, setQueryType] = useState('email');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [history, setHistory] = useState([
    { id: 'DWM_441', query: 'j***@gmail.com', type: 'email', exposed: true, breaches: 3, score: 82 },
    { id: 'DWM_502', query: 'user1992', type: 'username', exposed: false, breaches: 0, score: 8 },
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    // Animate scan steps
    for (let i = 0; i < SCAN_STEPS.length; i++) {
      setScanStep(SCAN_STEPS[i]);
      await new Promise(r => setTimeout(r, 480));
    }

    try {
      const response = await axios.post(`${API_BASE}/api/darkweb`, {
        query: query.trim(),
        type: queryType,
      });
      setResult(response.data);
      const entry = {
        id: `DWM_${Math.floor(Math.random() * 999)}`,
        query: query.length > 20 ? query.slice(0, 8) + '***' + query.slice(-4) : query,
        type: queryType,
        exposed: response.data.exposed,
        breaches: response.data.breach_count,
        score: response.data.risk_score,
      };
      setHistory(prev => [entry, ...prev].slice(0, 10));
    } catch (err) {
      if (!err.response) {
        setResult({ error: 'Network Error: Neural Core (Backend) is offline. Start the Flask server.' });
      } else {
        setResult({ error: err.response?.data?.message || 'Scan failed. Check your input and retry.' });
      }
    } finally {
      setLoading(false);
      setScanStep('');
    }
  };

  const getVisuals = (score, exposed) => {
    if (!exposed || score < 25) return {
      color: 'text-cyber-green', border: 'border-cyber-green/40',
      bg: 'bg-cyber-green/5', glow: 'shadow-[0_0_40px_rgba(57,255,20,0.25)]',
      label: 'NO EXPOSURE DETECTED', barColor: 'bg-cyber-green', image: '/safe.png'
    };
    if (score < 65) return {
      color: 'text-amber-400', border: 'border-amber-400/40',
      bg: 'bg-amber-400/5', glow: 'shadow-[0_0_40px_rgba(251,191,36,0.25)]',
      label: 'PARTIAL EXPOSURE', barColor: 'bg-amber-400', image: '/warning.png'
    };
    return {
      color: 'text-cyber-neon-red', border: 'border-cyber-neon-red/40',
      bg: 'bg-cyber-neon-red/5', glow: 'shadow-[0_0_40px_rgba(255,49,49,0.3)]',
      label: 'CRITICAL BREACH EXPOSURE', barColor: 'bg-cyber-neon-red', image: '/danger.png'
    };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-cyber-purple/10 rounded-2xl border border-cyber-purple/30">
          <Eye className="w-8 h-8 text-cyber-purple shadow-[0_0_15px_rgba(188,19,254,0.4)]" />
        </div>
        <div>
          <h2 className="text-4xl font-black text-white glow-text uppercase tracking-tighter">Dark Web Monitor</h2>
          <p className="text-slate-400">Breach Index Scanner · Paste Site Crawler · Credential Leak Detector</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Input Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="cyber-card p-10 space-y-8 bg-black/40 backdrop-blur-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Query type selector */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Query Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'email', label: 'Email', icon: Mail },
                    { value: 'username', label: 'Username', icon: User },
                    { value: 'domain', label: 'Domain', icon: Globe },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setQueryType(value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all font-black text-xs uppercase tracking-widest
                        ${queryType === value
                          ? 'border-cyber-purple/60 bg-cyber-purple/15 text-cyber-purple shadow-[0_0_20px_rgba(188,19,254,0.2)]'
                          : 'border-white/10 bg-white/[0.02] text-slate-500 hover:border-white/20'
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Input */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {queryType === 'email' ? 'Email Address' : queryType === 'username' ? 'Username / Handle' : 'Domain Name'}
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                  <input
                    type="text"
                    required
                    className="w-full cyber-input text-lg pl-12"
                    placeholder={
                      queryType === 'email' ? 'analyst@example.com'
                      : queryType === 'username' ? 'hacker_user99'
                      : 'target-domain.com'
                    }
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="cyber-button w-full py-5 bg-cyber-purple/20 border-cyber-purple/40 text-cyber-purple font-black uppercase flex items-center justify-center gap-3"
              >
                {loading
                  ? <><div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /><span className="text-xs font-bold animate-pulse">{scanStep}</span></>
                  : <><span>INITIATE DARK SCAN</span><Eye className="w-5 h-5" /></>
                }
              </button>
            </form>
          </div>

          {/* Scan History */}
          <div className="cyber-card p-8 bg-black/40">
            <div className="flex items-center gap-3 mb-6">
              <History className="w-5 h-5 text-cyber-purple" />
              <h4 className="text-sm font-black text-white uppercase tracking-widest">Recent Scans</h4>
            </div>
            <div className="space-y-3">
              {history.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${item.exposed ? 'bg-cyber-neon-red' : 'bg-cyber-green'}`} />
                    <div>
                      <p className="text-xs font-black text-white font-mono">{item.query}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">{item.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-black ${item.exposed ? 'text-cyber-neon-red' : 'text-cyber-green'}`}>
                      {item.exposed ? `${item.breaches} BREACH${item.breaches > 1 ? 'ES' : ''}` : 'CLEAN'}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">{item.score}% risk</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right: Results Panel */}
        <div className="space-y-8">
          <AnimatePresence mode="wait">
            {/* Error State */}
            {result && result.error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="cyber-card border-cyber-neon-red/40 bg-cyber-neon-red/5 flex items-center gap-6 p-8"
              >
                <div className="p-4 bg-cyber-neon-red/10 rounded-2xl">
                  <XCircle className="w-10 h-10 text-cyber-neon-red" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-cyber-neon-red uppercase tracking-tight">Scan Failed</h4>
                  <p className="text-slate-400 mt-1 font-bold text-sm italic">{result.error}</p>
                </div>
              </motion.div>
            )}

            {/* Success Result */}
            {result && !result.error && (() => {
              const v = getVisuals(result.risk_score, result.exposed);
              return (
                <motion.div key="darkweb-result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                  {/* Verdict Card */}
                  <div className={`cyber-card p-10 border-2 transition-all duration-700 ${v.border} ${v.bg} ${v.glow}`}>
                    <div className="flex flex-col lg:flex-row items-center gap-8">
                      <motion.img
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        src={v.image}
                        className="w-36 h-36 object-contain"
                        alt="verdict"
                      />
                      <div className="text-center lg:text-left flex-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Exposure Verdict</p>
                        <h3 className={`text-5xl font-black italic tracking-tighter mb-3 ${v.color}`}>
                          {result.exposed ? 'EXPOSED' : 'SECURE'}
                        </h3>
                        <div className={`inline-block px-4 py-1.5 rounded-lg border ${v.border} text-[10px] font-black uppercase tracking-widest ${v.color} bg-black/40`}>
                          {v.label}
                        </div>
                        {result.breach_count > 0 && (
                          <p className="text-slate-400 mt-3 text-sm font-bold">
                            Found in <span className="text-cyber-neon-red font-black">{result.breach_count}</span> breach database{result.breach_count > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3 mt-8 pt-8 border-t border-white/5">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exposure Risk Score</span>
                        <span className={`text-4xl font-black font-mono ${v.color}`}>{result.risk_score}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.risk_score}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className={`h-full rounded-full ${v.barColor}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Breach Details */}
                  {result.breaches?.length > 0 && (
                    <div className="cyber-card p-8 bg-black/60 border-white/10">
                      <div className="flex items-center gap-3 mb-6">
                        <Database className="w-5 h-5 text-cyber-neon-red" />
                        <h4 className="text-sm font-black text-white uppercase tracking-widest">Breach Records</h4>
                      </div>
                      <div className="space-y-3">
                        {result.breaches.map((breach, idx) => (
                          <div key={idx} className="p-5 rounded-2xl bg-cyber-neon-red/5 border border-cyber-neon-red/20 hover:bg-cyber-neon-red/10 transition-all">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-sm font-black text-cyber-neon-red uppercase">{breach.name}</p>
                                <p className="text-xs text-slate-400 mt-1">{breach.description}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 ml-4">
                                <Clock className="w-3.5 h-3.5 text-slate-500" />
                                <span className="text-[10px] font-bold text-slate-500">{breach.date}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {breach.data_types?.map((dt, i) => (
                                <span key={i} className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-cyber-neon-red/10 border border-cyber-neon-red/20 text-cyber-neon-red">
                                  {dt}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Signal Audit Logs */}
                  <div className="cyber-card p-8 bg-black/60 border-white/10">
                    <div className="flex items-center gap-3 mb-6">
                      <ListFilter className="w-5 h-5 text-cyber-purple" />
                      <h4 className="text-sm font-black text-white uppercase tracking-widest">Intelligence Signals</h4>
                    </div>
                    <div className="space-y-3">
                      {result.signals?.map((sig, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/[0.05] transition-all">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${sig.status === 'FAIL' ? 'bg-cyber-neon-red' : sig.status === 'WARN' ? 'bg-amber-400' : 'bg-cyber-green'}`} />
                          <div>
                            <p className="text-xs font-black text-white uppercase tracking-wide">{sig.label}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{sig.detail}</p>
                          </div>
                          <span className={`ml-auto text-[10px] font-black shrink-0 ${sig.status === 'FAIL' ? 'text-cyber-neon-red' : sig.status === 'WARN' ? 'text-amber-400' : 'text-cyber-green'}`}>
                            {sig.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  {result.recommendations?.length > 0 && (
                    <div className="cyber-card p-8 bg-black/60 border-white/10">
                      <div className="flex items-center gap-3 mb-6">
                        <ShieldCheck className="w-5 h-5 text-cyber-green" />
                        <h4 className="text-sm font-black text-white uppercase tracking-widest">Remediation Actions</h4>
                      </div>
                      <div className="space-y-3">
                        {result.recommendations.map((rec, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-cyber-green/5 border border-cyber-green/20 text-sm text-slate-300 font-medium">
                            <ChevronRight className="w-4 h-4 text-cyber-green shrink-0" />
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })()}
          </AnimatePresence>

          {/* Idle State */}
          {!result && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="cyber-card p-12 flex flex-col items-center text-center space-y-6 bg-black/30 border-dashed border-white/10"
            >
              <div className="w-20 h-20 rounded-full bg-cyber-purple/10 border border-cyber-purple/20 flex items-center justify-center">
                <Eye className="w-10 h-10 text-cyber-purple opacity-60" />
              </div>
              <div>
                <p className="text-white font-black text-xl uppercase tracking-tight">Awaiting Target Query</p>
                <p className="text-slate-500 text-sm mt-2">Enter an email, username, or domain to begin dark web surveillance scan</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function History({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}
