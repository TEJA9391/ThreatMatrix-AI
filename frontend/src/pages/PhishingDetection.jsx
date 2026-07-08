import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Globe, ShieldCheck, ShieldAlert, Cpu, ThumbsUp, ThumbsDown, 
  Clock, ExternalLink, ChevronRight, Database, Zap, Lock, Unlock, AlertTriangle, ListFilter, XCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { API_BASE as CONFIG_API_BASE } from '../config';
const API_BASE = `${CONFIG_API_BASE}/api`;

export default function PhishingDetection() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState('scan');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get(`${API_BASE}/phishing/submissions`);
      setSubmissions(response.data);
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE}/phishing`, { url });
      setResult(response.data);
      fetchSubmissions();
    } catch (err) {
      console.error("Scan failed:", err);
      if (err.response && err.response.data.error === "INVALID_INPUT") {
        setError(err.response.data);
      } else if (!err.response) {
        setError({ message: "Network Error: System Core (Backend) is offline. Please start the Flask server." });
      } else {
        setError({ message: "An unexpected error occurred. Please ensure your URL is correct." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (id, type) => {
    try {
      await axios.post(`${API_BASE}/phishing/vote`, { id, type });
      fetchSubmissions();
    } catch (error) {
      console.error("Vote failed:", error);
    }
  };

  const getRiskVisuals = (confidence, prediction) => {
    if (prediction === 'Safe' && confidence < 40) {
      return {
        image: '/safe.png',
        color: 'text-cyber-neon',
        glow: 'shadow-[0_0_40px_rgba(0,243,255,0.3)]',
        border: 'border-cyber-neon/40',
        bg: 'bg-cyber-neon/5',
        label: 'SECURE NODE',
        icon: ShieldCheck
      };
    }
    if (confidence < 65) {
      return {
        image: '/warning.png',
        color: 'text-amber-400',
        glow: 'shadow-[0_0_40px_rgba(251,191,36,0.3)]',
        border: 'border-amber-400/40',
        bg: 'bg-amber-400/5',
        label: 'SUSPICIOUS ACTIVITY',
        icon: AlertTriangle
      };
    }
    return {
      image: '/danger.png',
      color: 'text-cyber-neon-red',
      glow: 'shadow-[0_0_40px_rgba(255,49,49,0.3)]',
      border: 'border-cyber-neon-red/40',
      bg: 'bg-cyber-neon-red/5',
      label: 'MALICIOUS THREAT',
      icon: ShieldAlert
    };
  };

  const highlightUrl = (url) => {
    const suspicious = ['login', 'verify', 'account', 'secure', 'banking', 'update', 'signin', 'wp-admin', 'pay'];
    let highlighted = url;
    suspicious.forEach(word => {
      if (url.toLowerCase().includes(word)) {
        highlighted = highlighted.replace(new RegExp(word, 'gi'), (match) => 
          `<span class="text-cyber-neon-red font-bold underline">${match}</span>`
        );
      }
    });
    return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-2 py-0.5 bg-cyber-neon/10 border border-cyber-neon/30 text-[10px] font-black text-cyber-neon rounded uppercase tracking-widest animate-pulse">
              LIVE API: PhishTank & Protocol Guard Connected
            </div>
          </div>
          <h2 className="text-4xl font-black text-white glow-text uppercase tracking-tighter">PhishGuard Ultra v2.1</h2>
          <p className="text-slate-400 mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyber-neon shadow-[0_0_8px_#00f3ff]" />
            Deep Packet Analysis & Real-time PhishTank DB
          </p>
        </div>
        
        <div className="flex bg-cyber-black/40 p-1 rounded-xl border border-white/5 backdrop-blur-xl">
          <button 
            onClick={() => setActiveTab('scan')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'scan' ? 'bg-cyber-neon text-cyber-black shadow-[0_0_20px_rgba(0,243,255,0.3)]' : 'text-slate-400 hover:text-white'}`}
          >
            DB SCANNER
          </button>
          <button 
            onClick={() => setActiveTab('verify')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'verify' ? 'bg-cyber-purple text-white shadow-[0_0_20px_rgba(188,19,254,0.3)]' : 'text-slate-400 hover:text-white'}`}
          >
            COMMUNITY FEED
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'scan' ? (
          <motion.div 
            key="scan"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            <div className="cyber-card relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-cyber-neon transition-all group-hover:w-2" />
              <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Database className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyber-neon transition-colors" />
                  <input 
                    type="text" 
                    className="w-full cyber-input pl-12 py-5 text-white text-lg font-mono" 
                    placeholder="Enter URL to check (e.g. http://login.bank.com)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="cyber-button px-10 py-5 flex items-center justify-center gap-3 whitespace-nowrap text-lg uppercase font-black"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-3 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      INITIALIZE SCAN 
                      <Search className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="cyber-card border-cyber-neon-red/40 bg-cyber-neon-red/5 flex items-center gap-6 p-8"
              >
                <div className="p-4 bg-cyber-neon-red/10 rounded-2xl">
                   <XCircle className="w-10 h-10 text-cyber-neon-red" />
                </div>
                <div>
                   <h4 className="text-xl font-black text-cyber-neon-red uppercase tracking-tight">{error.message}</h4>
                   <p className="text-slate-400 mt-1 font-bold text-sm italic">{error.suggestion || "Please check the protocol (http/https) and try again."}</p>
                </div>
              </motion.div>
            )}

            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {/* Dynamic Result Card */}
                {(() => {
                  const visuals = getRiskVisuals(result.confidence, result.prediction);
                  return (
                    <div className={`md:col-span-2 cyber-card flex flex-col justify-center border-2 transition-all duration-700 ${visuals.border} ${visuals.bg} ${visuals.glow}`}>
                      <div className="flex flex-col lg:flex-row items-center gap-10">
                        <div className="relative w-48 h-48 flex-shrink-0">
                          <motion.img 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            src={visuals.image} 
                            alt="Risk Status" 
                            className="w-full h-full object-contain relative z-10"
                          />
                          <div className={`absolute inset-0 blur-3xl opacity-20 rounded-full bg-current ${visuals.color}`} />
                        </div>
                        
                        <div className="text-center lg:text-left flex-1">
                          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-4">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Engine Verdict:</span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${visuals.border} ${visuals.color} bg-black/40`}>
                               {visuals.label}
                            </span>
                          </div>
                          
                          <h3 className={`text-6xl font-black italic tracking-tighter mb-4 ${visuals.color}`}>
                            {result.prediction.toUpperCase()}
                          </h3>
                          
                          <div className="flex items-center justify-center lg:justify-start gap-4">
                            {result.external_link && (
                              <a 
                                href={result.external_link} 
                                target="_blank" 
                                rel="noreferrer"
                                className="cyber-button-sm flex items-center gap-2 text-[10px] bg-cyber-neon-red/10 border-cyber-neon-red/30 text-cyber-neon-red"
                              >
                                PHISHTANK RECORD <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase">
                              {url.startsWith('https://') ? <Lock className="w-3 h-3 text-cyber-green" /> : <Unlock className="w-3 h-3 text-cyber-neon-red" />}
                              {url.startsWith('https://') ? 'SSL Encrypted' : 'No Encryption'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="cyber-card flex flex-col justify-between bg-black/40 border border-white/5 relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-5 rotate-12">
                    <Zap className="w-32 h-32 text-white" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 text-center">Threat Confidence Matrix</h4>
                    <div className="flex flex-col items-center">
                      <div className={`text-7xl font-black tracking-tighter ${result.confidence > 80 ? 'text-cyber-neon-red' : result.confidence > 40 ? 'text-amber-400' : 'text-cyber-neon'}`}>
                        {result.confidence}%
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full mt-8 overflow-hidden border border-white/10 p-0.5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${result.confidence}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className={`h-full rounded-full ${result.confidence > 80 ? 'bg-cyber-neon-red shadow-[0_0_15px_#ff3131]' : result.confidence > 40 ? 'bg-amber-400' : 'bg-cyber-neon shadow-[0_0_15px_#00f3ff]'}`} 
                        />
                      </div>
                      <p className="text-[9px] text-slate-500 uppercase mt-4 font-black tracking-widest">Neural Probability score</p>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-[8px] text-slate-600 font-bold uppercase">SSL Check</p>
                      <p className={`text-[10px] font-black ${url.startsWith('https://') ? 'text-cyber-green' : 'text-cyber-neon-red'}`}>{url.startsWith('https://') ? 'VALID' : 'MISSING'}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-slate-600 font-bold uppercase">Analysis</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase">DETERMINISTIC</p>
                    </div>
                  </div>
                </div>

                {/* 10-Signal Analysis Grid */}
                <div className="md:col-span-3 cyber-card bg-black/60 border-white/10 relative overflow-hidden">
                   <div className="flex items-center gap-3 mb-6">
                      <ListFilter className="w-5 h-5 text-cyber-neon" />
                      <h4 className="text-sm font-black text-white uppercase tracking-widest">10-Signal Threat Analysis</h4>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {result.signals?.map((sig, idx) => {
                        const isPass = sig.status === 'PASS';
                        const isWarn = sig.status === 'WARN';
                        const borderCls = isPass ? 'border-cyber-green/20 bg-cyber-green/5' : isWarn ? 'border-amber-400/20 bg-amber-400/5' : 'border-cyber-neon-red/20 bg-cyber-neon-red/5';
                        const dotCls = isPass ? 'bg-cyber-green' : isWarn ? 'bg-amber-400' : 'bg-cyber-neon-red';
                        const labelCls = isPass ? 'text-cyber-green' : isWarn ? 'text-amber-400' : 'text-cyber-neon-red';
                        return (
                          <div key={idx} className={`p-4 rounded-xl border ${borderCls} flex flex-col gap-1.5`}>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotCls}`} />
                              <span className="text-[10px] font-black text-white uppercase tracking-wide">{sig.label}</span>
                              <span className={`ml-auto text-[9px] font-black uppercase ${labelCls}`}>{sig.status}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed pl-4">{sig.detail}</p>
                            {sig.weight !== 0 && (
                              <div className={`text-[9px] font-black uppercase pl-4 ${sig.weight > 0 ? 'text-cyber-neon-red' : 'text-cyber-green'}`}>
                                {sig.weight > 0 ? `+${sig.weight}` : sig.weight} risk pts
                              </div>
                            )}
                          </div>
                        );
                      })}
                   </div>
                </div>

                <div className="md:col-span-3 cyber-card bg-black/60 border-white/10 shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-10 opacity-5">
                      <Cpu className="w-40 h-40" />
                   </div>
                  <h4 className="text-sm font-black text-white mb-6 flex items-center gap-3">
                    <div className="w-1.5 h-5 bg-cyber-neon shadow-[0_0_10px_#00f3ff]" />
                    DEEP URL ANALYSIS (X-RAY MODE)
                  </h4>
                  <div className="bg-black/90 p-8 rounded-3xl font-mono text-2xl break-all border border-white/10 shadow-inner group-hover:border-cyber-neon/30 transition-all leading-relaxed">
                    {highlightUrl(url)}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="verify"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-4">
              {submissions.map((sub, idx) => (
                <motion.div 
                  key={sub.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="cyber-card group hover:border-white/20 transition-all flex flex-col md:flex-row items-center gap-6 py-8 px-8 bg-black/40"
                >
                  <div className={`p-5 rounded-2xl border ${sub.status === 'Phishing' ? 'bg-cyber-neon-red/10 text-cyber-neon-red border-cyber-neon-red/20' : sub.status === 'Safe' ? 'bg-cyber-neon/10 text-cyber-neon border-cyber-neon/20' : 'bg-white/5 text-slate-400 border-white/10'}`}>
                    {sub.status === 'Phishing' ? <ShieldAlert className="w-10 h-10" /> : sub.status === 'Safe' ? <ShieldCheck className="w-10 h-10" /> : <Clock className="w-10 h-10" />}
                  </div>
                  
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{sub.id}</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${sub.status === 'Phishing' ? 'bg-cyber-neon-red text-white' : sub.status === 'Safe' ? 'bg-cyber-neon text-cyber-black' : 'bg-slate-700 text-white'}`}>
                        {sub.status}
                      </span>
                    </div>
                    <div className="text-xl font-black text-white truncate flex items-center gap-3">
                      {sub.url}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleVote(sub.id, 'phish')}
                      className="p-4 bg-cyber-neon-red/10 text-cyber-neon-red rounded-xl hover:bg-cyber-neon-red hover:text-white transition-all shadow-lg active:scale-95"
                    >
                      <ThumbsDown className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={() => handleVote(sub.id, 'safe')}
                      className="p-4 bg-cyber-neon/10 text-cyber-neon rounded-xl hover:bg-cyber-neon hover:text-cyber-black transition-all shadow-lg active:scale-95"
                    >
                      <ThumbsUp className="w-6 h-6" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
