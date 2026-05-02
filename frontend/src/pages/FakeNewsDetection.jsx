import React, { useState } from 'react';
import axios from 'axios';
import { 
  FileText, CheckCircle2, AlertCircle, Search, Sparkles, ShieldCheck, 
  AlertTriangle, ShieldAlert, ListFilter, Globe, Star, Info, XCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FakeNewsDetection() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!text) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await axios.post('http://localhost:5001/api/fake-news', { text });
      setResult(response.data);
    } catch (err) {
      if (err.response && err.response.data.error === "INVALID_INPUT") {
        setError(err.response.data);
      } else {
        setError({ message: "Content rejected. Ensure you are pasting news text, not links or short strings." });
      }
    } finally {
      setLoading(false);
    }
  };

  const getRiskVisuals = (confidence, prediction) => {
    if (prediction === 'Real' && confidence < 40) return { image: '/safe.png', color: 'text-cyber-green', glow: 'shadow-[0_0_40px_rgba(57,255,20,0.3)]', border: 'border-cyber-green/40', bg: 'bg-cyber-green/5', label: 'VERIFIED TRUTH' };
    if (confidence < 70) return { image: '/warning.png', color: 'text-amber-400', glow: 'shadow-[0_0_40px_rgba(251,191,36,0.3)]', border: 'border-amber-400/40', bg: 'bg-amber-400/5', label: 'UNVERIFIED DATA' };
    return { image: '/danger.png', color: 'text-cyber-neon-red', glow: 'shadow-[0_0_40px_rgba(255,49,49,0.3)]', border: 'border-cyber-neon-red/40', bg: 'bg-cyber-neon-red/5', label: 'DEBUNKED FALSEHOOD' };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-cyber-green/10 rounded-2xl border border-cyber-green/30"><Globe className="w-8 h-8 text-cyber-green shadow-[0_0_15px_rgba(57,255,20,0.4)]" /></div>
        <div>
          <h2 className="text-4xl font-black text-white glow-text uppercase tracking-tighter">Truth Sentinel v3.0</h2>
          <p className="text-slate-400">Google Fact Check & Wikipedia Cross-Reference Engine</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="cyber-card p-10 bg-black/40 backdrop-blur-xl">
          <form onSubmit={handleAnalyze} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Sparkles className="w-3 h-3 text-cyber-green" /> Article / Headline Content</label>
              <textarea rows="8" className="w-full cyber-input resize-none text-white py-5 px-6 text-lg" placeholder="Paste headline or article text to fact-check..." value={text} onChange={(e) => setText(e.target.value)} />
            </div>
            <button type="submit" disabled={loading || !text} className="cyber-button w-full py-5 flex items-center justify-center gap-3 font-black uppercase tracking-widest">
              {loading ? <div className="w-6 h-6 border-3 border-black/20 border-t-black rounded-full animate-spin" /> : <>START FACT CHECK <Search className="w-5 h-5" /></>}
            </button>
          </form>
        </div>

        <div className="space-y-8">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full cyber-card border-cyber-neon-red/40 bg-cyber-neon-red/5 flex flex-col items-center justify-center text-center p-12"
              >
                <div className="p-6 bg-cyber-neon-red/10 rounded-full mb-6">
                   <XCircle className="w-16 h-16 text-cyber-neon-red shadow-[0_0_20px_rgba(255,49,49,0.3)]" />
                </div>
                <h4 className="text-2xl font-black text-cyber-neon-red uppercase tracking-tight">{error.message}</h4>
                <p className="text-slate-400 mt-4 font-bold text-sm italic max-w-sm">{error.suggestion || "Please paste a text paragraph or headline for analysis."}</p>
              </motion.div>
            )}

            {result && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                {(() => {
                  const visuals = getRiskVisuals(result.confidence, result.prediction);
                  return (
                    <div className={`cyber-card p-10 border-2 transition-all duration-700 ${visuals.border} ${visuals.bg} ${visuals.glow}`}>
                      <div className="flex flex-col lg:flex-row items-center gap-10">
                        <motion.img initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} src={visuals.image} className="w-40 h-40 object-contain relative z-10" />
                        <div className="text-center lg:text-left flex-1">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Google Fact Check Verdict</p>
                          <h3 className={`text-6xl font-black italic tracking-tighter mb-4 ${visuals.color}`}>{result.prediction.toUpperCase()}</h3>
                          <div className={`inline-block px-4 py-1.5 rounded-lg border ${visuals.border} text-[10px] font-black uppercase tracking-widest ${visuals.color} bg-black/40 shadow-xl`}>{visuals.label}</div>
                        </div>
                      </div>
                      <div className="space-y-4 mt-10 pt-10 border-t border-white/5">
                         <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Credibility</span>
                            <span className={`text-4xl font-black font-mono ${visuals.color}`}>{100 - result.confidence}%</span>
                         </div>
                         <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5"><motion.div initial={{ width: 0 }} animate={{ width: `${100 - result.confidence}%` }} className={`h-full rounded-full ${visuals.image === '/safe.png' ? 'bg-cyber-green' : visuals.image === '/warning.png' ? 'bg-amber-400' : 'bg-cyber-neon-red'}`} /></div>
                      </div>
                    </div>
                  );
                })()}

                {/* Source Comparison Section */}
                <div className="cyber-card p-8 bg-black/60 border-white/10">
                   <div className="flex items-center gap-3 mb-6"><ListFilter className="w-5 h-5 text-cyber-green" /><h4 className="text-sm font-black text-white uppercase tracking-widest">Cross-Reference Sources</h4></div>
                   <div className="grid grid-cols-1 gap-4">
                      {result.sources?.map((source, idx) => (
                        <div key={idx} className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all group">
                           <div className="flex items-center gap-4">
                              <Globe className="w-5 h-5 text-slate-500 group-hover:text-cyber-green transition-colors" />
                              <div>
                                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{source.name}</p>
                                 <p className={`text-sm font-black italic ${source.status === 'True' || source.status === 'Matched' || source.status === 'Credible' ? 'text-cyber-green' : source.status === 'False' || source.status === 'Conflicting' || source.status === 'Debunked' ? 'text-cyber-neon-red' : 'text-amber-400'}`}>{source.status.toUpperCase()}</p>
                              </div>
                           </div>
                           <div className="flex gap-1">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} className={`w-3 h-3 ${s <= source.rating ? 'text-cyber-green fill-cyber-green' : 'text-slate-700'}`} />
                              ))}
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="lg:col-span-2 cyber-card bg-black/60 relative overflow-hidden">
          <h4 className="text-sm font-black text-white mb-8 flex items-center gap-3 uppercase tracking-widest"><Info className="w-4 h-4 text-cyber-green" /> Linguistic Integrity Audit</h4>
          <div className="bg-black/90 p-10 rounded-[2rem] border border-white/10 shadow-inner italic text-slate-300 text-lg leading-relaxed">
             {text || "Awaiting content for deep semantic analysis..."}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
             {result?.reasons?.map((reason, idx) => (
               <div key={idx} className="flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-xl text-xs text-slate-400 font-medium">
                  <div className="w-1 h-4 bg-cyber-green/30 rounded-full" />
                  {reason}
               </div>
             ))}
          </div>
      </div>
    </div>
  );
}
