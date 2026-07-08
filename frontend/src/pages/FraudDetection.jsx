import React, { useState } from 'react';
import axios from 'axios';
import { 
  ShieldAlert, Send, Info, Activity, Zap, Landmark, MapPin, Clock, 
  ShieldCheck, ChevronRight, AlertTriangle, ListFilter, Globe, Star, XCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FraudDetection() {
  const [formData, setFormData] = useState({ amount: '', time: '', location: '', merchant: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([
    { id: 'FRD_882', merchant: 'Global Store', amount: 1250, location: 'London, UK', status: 'Safe', risk: 12, time: '09:12' },
    { id: 'FRD_901', merchant: 'CryptoEx', amount: 4500, location: 'Unknown', status: 'Fraud', risk: 89, time: '10:45' }
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const response = await axios.post('http://localhost:5001/api/fraud', { ...formData, amount: parseFloat(formData.amount) });
      setResult(response.data);
      const newScan = { id: `FRD_${Math.floor(Math.random() * 999)}`, merchant: formData.merchant, amount: parseFloat(formData.amount), location: formData.location, status: response.data.prediction, risk: response.data.risk_score, time: formData.time };
      setHistory(prev => [newScan, ...prev]);
    } catch (err) {
      console.error("Fraud audit failed:", err);
      if (!err.response) {
        setResult({ error: "Network Error: Neural Core (Backend) is offline. Please start the Flask server." });
      } else {
        setResult({ error: "Audit failed. Please check your input parameters and retry." });
      }
    } finally {
      setLoading(false);
    }
  };

  const getRiskVisuals = (risk, status) => {
    if (status === 'Safe' && risk < 40) return { image: '/safe.png', color: 'text-cyber-green', glow: 'shadow-[0_0_40px_rgba(57,255,20,0.3)]', border: 'border-cyber-green/40', bg: 'bg-cyber-green/5', label: 'CLEARED TRANSACTION' };
    if (risk < 70) return { image: '/warning.png', color: 'text-amber-400', glow: 'shadow-[0_0_40px_rgba(251,191,36,0.3)]', border: 'border-amber-400/40', bg: 'bg-amber-400/5', label: 'ANOMALOUS VECTOR' };
    return { image: '/danger.png', color: 'text-cyber-neon-red', glow: 'shadow-[0_0_40px_rgba(255,49,49,0.3)]', border: 'border-cyber-neon-red/40', bg: 'bg-cyber-neon-red/5', label: 'HIGH PROBABILITY FRAUD' };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-cyber-purple/10 rounded-2xl border border-cyber-purple/30"><ShieldAlert className="w-8 h-8 text-cyber-purple shadow-[0_0_15px_rgba(188,19,254,0.4)]" /></div>
        <div>
          <h2 className="text-4xl font-black text-white glow-text uppercase tracking-tighter">Fraud Sentinel v2.0</h2>
          <p className="text-slate-400">IPQualityScore Integration & Neural Anomaly Detection</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="cyber-card p-10 space-y-8 bg-black/40 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount (USD)</label>
                <input type="number" required className="w-full cyber-input text-lg" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Timestamp</label>
                <input type="text" required className="w-full cyber-input text-lg" placeholder="HH:MM" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><MapPin className="w-3 h-3 text-cyber-purple" /> IP Address / Origin Node</label>
              <input type="text" required className="w-full cyber-input text-lg" placeholder="192.168.1.1 or City Name" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Merchant Entity</label>
              <input type="text" required className="w-full cyber-input text-lg" placeholder="Entity Identifier" value={formData.merchant} onChange={(e) => setFormData({...formData, merchant: e.target.value})} />
            </div>
            <button type="submit" disabled={loading} className="cyber-button w-full py-5 bg-cyber-purple/20 border-cyber-purple/40 text-cyber-purple font-black uppercase">
              {loading ? <div className="w-6 h-6 border-3 border-current border-t-transparent rounded-full animate-spin" /> : <>EXECUTE NEURAL AUDIT <Activity className="w-5 h-5" /></>}
            </button>
          </form>
        </motion.div>

        <div className="space-y-8">
          <AnimatePresence mode="wait">
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
                   <h4 className="text-xl font-black text-cyber-neon-red uppercase tracking-tight">Audit Failed</h4>
                   <p className="text-slate-400 mt-1 font-bold text-sm italic">{result.error}</p>
                </div>
              </motion.div>
            )}

            {result && !result.error && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                {(() => {
                  const visuals = getRiskVisuals(result.risk_score, result.prediction);
                  return (
                    <div className={`cyber-card p-10 border-2 transition-all duration-700 ${visuals.border} ${visuals.bg} ${visuals.glow}`}>
                      <div className="flex flex-col lg:flex-row items-center gap-10">
                        <motion.img initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} src={visuals.image} className="w-40 h-40 object-contain relative z-10" />
                        <div className="text-center lg:text-left flex-1">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Audit Verdict</p>
                          <h3 className={`text-6xl font-black italic tracking-tighter mb-4 ${visuals.color}`}>{result.prediction.toUpperCase()}</h3>
                          <div className={`inline-block px-4 py-1.5 rounded-lg border ${visuals.border} text-[10px] font-black uppercase tracking-widest ${visuals.color} bg-black/40 shadow-xl`}>{visuals.label}</div>
                        </div>
                      </div>
                      <div className="space-y-4 mt-10 pt-10 border-t border-white/5">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Final Fraud Score (IPQS Weighted)</span>
                          <span className={`text-4xl font-black font-mono ${visuals.color}`}>{result.risk_score}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5"><motion.div initial={{ width: 0 }} animate={{ width: `${result.risk_score}%` }} className={`h-full rounded-full ${visuals.image === '/danger.png' ? 'bg-cyber-neon-red' : visuals.image === '/warning.png' ? 'bg-amber-400' : 'bg-cyber-green'}`} /></div>
                      </div>
                    </div>
                  );
                })()}

                {/* Source Comparison Section */}
                <div className="cyber-card p-8 bg-black/60 border-white/10">
                   <div className="flex items-center gap-3 mb-6"><Globe className="w-5 h-5 text-cyber-purple" /><h4 className="text-sm font-black text-white uppercase tracking-widest">Cross-Reference Sources</h4></div>
                   <div className="grid grid-cols-1 gap-4">
                      {result.sources?.map((source, idx) => (
                        <div key={idx} className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all group">
                           <div className="flex items-center gap-4">
                              <Globe className="w-5 h-5 text-slate-500 group-hover:text-cyber-purple transition-colors" />
                              <div>
                                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{source.name}</p>
                                 <p className={`text-sm font-black italic ${source.status === 'Safe' || source.status === 'Verified' || source.status === 'Direct Connection' ? 'text-cyber-green' : 'text-cyber-neon-red'}`}>{source.status.toUpperCase()}</p>
                              </div>
                           </div>
                           <div className="flex gap-1">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} className={`w-3 h-3 ${s <= source.rating ? 'text-cyber-purple fill-cyber-purple' : 'text-slate-700'}`} />
                              ))}
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="cyber-card p-8 bg-black/60 border-white/10">
                   <div className="flex items-center gap-3 mb-6"><ListFilter className="w-5 h-5 text-cyber-purple" /><h4 className="text-sm font-black text-white uppercase tracking-widest">Audit Logs & Reasoning</h4></div>
                   <div className="grid grid-cols-1 gap-3">
                      {result.reasons?.map((reason, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-xl text-xs text-slate-300 font-medium">
                           <div className={`w-1.5 h-1.5 rounded-full ${reason.includes('+') ? 'bg-cyber-neon-red' : reason.includes('-') ? 'bg-cyber-green' : 'bg-cyber-purple'}`} />
                           {reason}
                        </div>
                      ))}
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
