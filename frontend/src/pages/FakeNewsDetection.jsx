import React, { useState } from 'react';
import axios from 'axios';
import {
  FileText, Search, Sparkles, Globe, Star, Info, XCircle,
  ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, AlertCircle,
  BarChart2, Brain, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { API_BASE } from '../config';

export default function FakeNewsDetection() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true); setResult(null); setError(null);
    try {
      const response = await axios.post(`${API_BASE}/api/fake-news`, { text });
      setResult(response.data);
    } catch (err) {
      if (err.response?.data?.error === 'INVALID_INPUT') {
        setError({ message: err.response.data.message || 'Text too short. Paste a full headline or paragraph.' });
      } else if (!err.response) {
        setError({ message: `Network Error: Backend offline. Start the Flask server on ${API_BASE}.` });
      } else {
        setError({ message: 'Analysis failed. Please try again.' });
      }
    } finally { setLoading(false); }
  };

  const getVerdict = (prediction, score) => {
    if (prediction === 'Real')       return { color: 'text-cyber-green',     glow: 'shadow-[0_0_40px_rgba(57,255,20,0.25)]',  border: 'border-cyber-green/40',     bg: 'bg-cyber-green/5',     label: 'VERIFIED CONTENT',     bar: 'bg-cyber-green' };
    if (prediction === 'Unverified') return { color: 'text-amber-400',        glow: 'shadow-[0_0_40px_rgba(251,191,36,0.25)]', border: 'border-amber-400/40',       bg: 'bg-amber-400/5',       label: 'UNVERIFIED CONTENT',   bar: 'bg-amber-400' };
    return                                  { color: 'text-cyber-neon-red',   glow: 'shadow-[0_0_40px_rgba(255,49,49,0.25)]',  border: 'border-cyber-neon-red/40',  bg: 'bg-cyber-neon-red/5',  label: 'MISINFORMATION DETECTED', bar: 'bg-cyber-neon-red' };
  };

  const getSignalIcon = (status) => {
    if (status === 'PASS') return <CheckCircle2 className="w-4 h-4 text-cyber-green flex-shrink-0" />;
    if (status === 'WARN') return <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />;
    return <AlertCircle className="w-4 h-4 text-cyber-neon-red flex-shrink-0" />;
  };

  const getSignalColor = (status) => {
    if (status === 'PASS') return 'border-cyber-green/20 bg-cyber-green/5';
    if (status === 'WARN') return 'border-amber-400/20 bg-amber-400/5';
    return 'border-cyber-neon-red/20 bg-cyber-neon-red/5';
  };

  const examples = [
    'Scientists at Harvard published a peer-reviewed study confirming that regular exercise reduces the risk of heart disease by 35% according to data from 10,000 participants.',
    'SHOCKING: Government ADMITS vaccines contain mind-control chips!! SHARE before they DELETE this!! Wake up sheeple, the deep state is hiding this from you!!',
    'Local authorities report a 12% rise in unemployment following factory closures. Economists are divided on long-term implications.',
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-cyber-green/10 rounded-2xl border border-cyber-green/30">
          <Brain className="w-8 h-8 text-cyber-green" />
        </div>
        <div>
          <h2 className="text-4xl font-black text-white glow-text uppercase tracking-tighter">Truth Sentinel v4.0</h2>
          <p className="text-slate-400 flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-cyber-green shadow-[0_0_8px_#39ff14]" />
            9-Signal Linguistic Intelligence Engine
          </p>
        </div>
      </div>

      {/* Input + Quick Examples */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 cyber-card p-8 bg-black/40 backdrop-blur-xl">
          <form onSubmit={handleAnalyze} className="space-y-5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-cyber-green" /> Article / Headline Content
            </label>
            <textarea
              rows={9}
              className="w-full cyber-input resize-none text-white py-4 px-5 text-base leading-relaxed"
              placeholder="Paste a news headline, article paragraph, or social media post to fact-check…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="cyber-button w-full py-4 flex items-center justify-center gap-3 font-black uppercase tracking-widest"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                : <><Search className="w-5 h-5" /> Analyze Content</>}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 cyber-card p-6 bg-black/40 space-y-3">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Zap className="w-3 h-3 text-cyber-green" /> Quick Test Examples
          </p>
          {examples.map((ex, i) => (
            <button
              key={i}
              onClick={() => setText(ex)}
              className="w-full text-left p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-cyber-green/5 hover:border-cyber-green/30 transition-all text-xs text-slate-400 hover:text-white leading-relaxed"
            >
              {ex.length > 100 ? ex.slice(0, 100) + '…' : ex}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="cyber-card border-cyber-neon-red/40 bg-cyber-neon-red/5 flex items-center gap-6 p-8"
          >
            <div className="p-4 bg-cyber-neon-red/10 rounded-2xl">
              <XCircle className="w-10 h-10 text-cyber-neon-red" />
            </div>
            <div>
              <h4 className="text-xl font-black text-cyber-neon-red uppercase">{error.message}</h4>
              <p className="text-slate-400 text-sm mt-1">Paste a full sentence or paragraph for accurate results.</p>
            </div>
          </motion.div>
        )}

        {result && (
          <motion.div key="result" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {(() => {
              const v = getVerdict(result.prediction, result.confidence);
              return (
                <>
                  {/* Verdict Card */}
                  <div className={`cyber-card p-8 border-2 ${v.border} ${v.bg} ${v.glow} transition-all duration-700`}>
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="text-center md:text-left flex-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Verdict</p>
                        <h3 className={`text-6xl font-black italic tracking-tighter ${v.color}`}>{result.prediction.toUpperCase()}</h3>
                        <div className={`inline-block mt-3 px-4 py-1.5 rounded-lg border ${v.border} text-[10px] font-black uppercase tracking-widest ${v.color} bg-black/40`}>
                          {v.label}
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-3 min-w-[160px]">
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Misinformation Risk</p>
                        <div className={`text-7xl font-black font-mono ${v.color}`}>{result.confidence}%</div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${result.confidence}%` }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                            className={`h-full rounded-full ${v.bar}`}
                          />
                        </div>
                        <p className="text-[9px] text-slate-600 uppercase font-black">{result.risk_level} Risk Level</p>
                      </div>
                    </div>
                  </div>

                  {/* Signal Grid */}
                  <div className="cyber-card p-8 bg-black/50">
                    <div className="flex items-center gap-3 mb-6">
                      <BarChart2 className="w-5 h-5 text-cyber-green" />
                      <h4 className="text-sm font-black text-white uppercase tracking-widest">9-Signal Analysis Breakdown</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {result.signals?.map((sig, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className={`p-4 rounded-xl border ${getSignalColor(sig.status)} flex flex-col gap-2`}
                        >
                          <div className="flex items-center gap-2">
                            {getSignalIcon(sig.status)}
                            <span className="text-[10px] font-black text-white uppercase tracking-wide">{sig.label}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{sig.detail}</p>
                          {sig.weight !== 0 && (
                            <div className={`text-[9px] font-black uppercase ${sig.weight > 0 ? 'text-cyber-neon-red' : 'text-cyber-green'}`}>
                              {sig.weight > 0 ? `+${sig.weight}` : sig.weight} risk pts
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Source credibility */}
                  <div className="cyber-card p-8 bg-black/60 border-white/10">
                    <div className="flex items-center gap-3 mb-6">
                      <Globe className="w-5 h-5 text-cyber-green" />
                      <h4 className="text-sm font-black text-white uppercase tracking-widest">Source Credibility Panel</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {result.sources?.map((src, i) => (
                        <div key={i} className="flex items-center justify-between p-5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all">
                          <div>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{src.name}</p>
                            <p className={`text-sm font-black italic ${
                              src.status === 'True' || src.status === 'Matched' || src.status === 'Credible'
                                ? 'text-cyber-green'
                                : src.status === 'False' || src.status === 'Debunked'
                                ? 'text-cyber-neon-red'
                                : 'text-amber-400'
                            }`}>{src.status.toUpperCase()}</p>
                          </div>
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`w-3.5 h-3.5 ${s <= src.rating ? 'text-cyber-green fill-cyber-green' : 'text-slate-700'}`} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Text preview */}
                  <div className="cyber-card bg-black/60 border-white/10 p-8">
                    <h4 className="text-sm font-black text-white mb-4 flex items-center gap-3 uppercase tracking-widest">
                      <Info className="w-4 h-4 text-cyber-green" /> Analyzed Content
                    </h4>
                    <div className="bg-black/90 p-6 rounded-2xl border border-white/10 italic text-slate-300 text-base leading-relaxed max-h-40 overflow-y-auto">
                      {text}
                    </div>
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
