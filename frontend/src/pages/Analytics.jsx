import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Calendar, Filter, Download, TrendingUp, Zap, Globe, Cpu, ShieldAlert, CheckCircle2, Radar, Target, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../hooks/useSocket';

export default function Analytics() {
  const { data, events } = useSocket();
  const [exporting, setExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [activeOrigins, setActiveOrigins] = useState([
    { city: 'Amsterdam', ip: '192.168.1.1', type: 'Phishing', risk: 'High' },
    { city: 'Singapore', ip: '103.45.12.9', type: 'Fraud', risk: 'Critical' },
    { city: 'San Jose', ip: '45.128.90.2', type: 'Fake News', risk: 'Medium' },
  ]);

  // Simulate shifting attack origins
  useEffect(() => {
    const interval = setInterval(() => {
      const cities = ['London', 'Tokyo', 'Berlin', 'New York', 'Mumbai', 'Sydney'];
      const types = ['Phishing', 'Fraud', 'Malware', 'DDOS'];
      const risks = ['High', 'Medium', 'Critical'];
      setActiveOrigins(prev => [
        { 
          city: cities[Math.floor(Math.random() * cities.length)], 
          ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.1.1`,
          type: types[Math.floor(Math.random() * types.length)],
          risk: risks[Math.floor(Math.random() * risks.length)]
        },
        ...prev.slice(0, 4)
      ]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 3000);
      const headers = "Time,Total Threats,Fraud,Phishing,News\n";
      const rows = data.threat_trends.map(t => `${t.time},${t.threats},${t.fraud},${t.phishing},${t.news}`).join("\n");
      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `CyberShield_SOC_Report_${new Date().getTime()}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, 2000);
  };

  if (!data) return (
    <div className="flex items-center justify-center h-[70vh]">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-16 h-16 border-2 border-cyber-neon/20 border-t-cyber-neon rounded-full" />
    </div>
  );

  const pieData = [
    { name: 'Fraud', value: data.fraud, color: '#bc13fe' },
    { name: 'Phishing', value: data.phishing, color: '#00f3ff' },
    { name: 'Fake News', value: data.fake_news, color: '#39ff14' },
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white glow-text uppercase tracking-tighter">Security Intelligence Analytics</h2>
          <p className="text-slate-400">Deep-dive telemetry and neural threat propagation metrics</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-cyber-neon/10 border border-cyber-neon/20 rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyber-neon animate-pulse" />
            <span className="text-[10px] font-black text-cyber-neon uppercase tracking-widest">Global Node Sync</span>
          </div>
          <button onClick={handleExport} disabled={exporting} className={`cyber-button flex items-center gap-2 text-xs font-black px-8 py-3 transition-all ${exporting ? 'bg-white/10 text-slate-500' : exportComplete ? 'bg-cyber-green text-black' : 'bg-cyber-neon text-black'}`}>
            {exporting ? <>EXPORTING ARCHIVE <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" /></> : exportComplete ? <>REPORT READY <CheckCircle2 className="w-4 h-4" /></> : <>DOWNLOAD SOC REPORT <Download className="w-4 h-4" /></>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Real-time Threat Origin Monitor */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 lg:col-span-2 overflow-hidden relative">
          <div className="flex items-center justify-between mb-8 relative z-10">
             <div className="flex items-center gap-3">
                <Radar className="w-5 h-5 text-cyber-neon-red animate-pulse" />
                <h3 className="text-lg font-black text-white uppercase tracking-widest italic">Live Threat Origin Monitor</h3>
             </div>
             <span className="text-[9px] font-black text-cyber-neon-red uppercase border border-cyber-neon-red/30 px-3 py-1 rounded-full">Active Ingress Detected</span>
          </div>
          
          <div className="h-[400px] relative">
             {/* Map Placeholder Graphic */}
             <div className="absolute inset-0 bg-white/[0.02] rounded-3xl overflow-hidden border border-white/5">
                <div className="absolute inset-0 opacity-10 flex items-center justify-center">
                   <Map className="w-64 h-64 text-slate-500" />
                </div>
                {/* Simulated Pins */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                   <AnimatePresence initial={false}>
                      {activeOrigins.map((origin, idx) => (
                        <motion.div 
                          key={origin.ip}
                          initial={{ opacity: 0, scale: 0.9, x: -20 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.9, x: 20 }}
                          className="p-4 bg-black/60 border border-white/10 rounded-2xl flex items-center justify-between backdrop-blur-md"
                        >
                           <div className="flex items-center gap-4">
                              <div className="p-2 bg-cyber-neon-red/10 rounded-lg">
                                 <Target className="w-4 h-4 text-cyber-neon-red" />
                              </div>
                              <div>
                                 <p className="text-[10px] font-black text-white uppercase">{origin.city}</p>
                                 <p className="text-[9px] font-mono text-slate-500">{origin.ip}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-[9px] font-black text-cyber-neon uppercase">{origin.type}</p>
                              <p className={`text-[8px] font-black uppercase ${origin.risk === 'Critical' ? 'text-cyber-neon-red' : 'text-amber-400'}`}>{origin.risk}</p>
                           </div>
                        </motion.div>
                      ))}
                   </AnimatePresence>
                </div>
             </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 flex flex-col items-center justify-center text-center">
          <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-8">Threat Allocation</h3>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={70} outerRadius={95} paddingAngle={8} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
               <p className="text-[10px] text-slate-500 font-black uppercase">Total</p>
               <p className="text-3xl font-black text-white">{data.total_threats}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 w-full mt-8">
             {pieData.map((item, idx) => (
               <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} /><span className="text-xs font-bold text-slate-400">{item.name}</span></div>
                  <span className="text-xs font-black text-white">{item.value}</span>
               </div>
             ))}
          </div>
        </motion.div>

        <div className="lg:col-span-3 glass-card p-10 bg-white/[0.01] border-white/5">
           <div className="flex items-center gap-3 mb-10">
              <TrendingUp className="w-6 h-6 text-cyber-neon" />
              <h3 className="text-xl font-black text-white uppercase tracking-[0.2em] italic">Neural Threat Propagation Velocity</h3>
           </div>
           <div className="h-[400px]">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={data.threat_trends}>
                 <defs>
                   <linearGradient id="colorPhish" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00f3ff" stopOpacity={0.3}/><stop offset="95%" stopColor="#00f3ff" stopOpacity={0}/></linearGradient>
                   <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#bc13fe" stopOpacity={0.3}/><stop offset="95%" stopColor="#bc13fe" stopOpacity={0}/></linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                 <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                 <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                 <Tooltip contentStyle={{ backgroundColor: 'rgba(10, 10, 15, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }} />
                 <Area type="monotone" dataKey="phishing" stroke="#00f3ff" fill="url(#colorPhish)" strokeWidth={3} />
                 <Area type="monotone" dataKey="fraud" stroke="#bc13fe" fill="url(#colorFraud)" strokeWidth={3} />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
}
