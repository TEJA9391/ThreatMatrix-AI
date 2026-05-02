import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  MailWarning, 
  FileText, 
  Activity, 
  TrendingUp, 
  Users, 
  Globe, 
  Cpu, 
  Zap,
  ArrowUpRight,
  Wifi,
  Database,
  Lock,
  BrainCircuit,
  Terminal,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../hooks/useSocket';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
  const { data, events } = useSocket();
  const [operatorCount, setOperatorCount] = useState(24);
  const [mitigationLogs, setMitigationLogs] = useState([
    { id: 'ACT-001', msg: 'Neural firewall rule updated for IP 103.45...', status: 'COMPLETED' },
    { id: 'ACT-002', msg: 'Revoked 4 compromised session tokens.', status: 'COMPLETED' },
    { id: 'ACT-003', msg: 'Isolated suspicious node in segment 7.', status: 'COMPLETED' },
  ]);
  const canvasRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setOperatorCount(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Hybrid Intelligence Mesh - High Visibility
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrame;

    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      size: Math.random() * 2 + 1,
      pulse: 0,
      isCore: Math.random() > 0.85
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width/2);
      grad.addColorStop(0, 'rgba(0, 243, 255, 0.05)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 110) {
            const opacity = (1 - dist / 110) * 0.2;
            ctx.strokeStyle = p.isCore || p2.isCore ? `rgba(188, 19, 254, ${opacity})` : `rgba(0, 243, 255, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            if (Math.random() > 0.998) { p.pulse = 1; p2.pulse = 1; }
          }
        }

        const color = p.isCore ? 'rgba(188, 19, 254, 0.9)' : 'rgba(0, 243, 255, 0.9)';
        ctx.fillStyle = color;
        ctx.shadowBlur = p.pulse * 15;
        ctx.shadowColor = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size + p.pulse * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (p.pulse > 0) p.pulse *= 0.96;
      });

      animationFrame = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [canvasRef.current]);

  useEffect(() => {
    if (events.length > 0) {
      const latest = events[0];
      setMitigationLogs(prev => [
        { id: `ACT-${Math.floor(Math.random() * 999)}`, msg: `Neutralized ${latest.type} vector.`, status: 'SUCCESS' },
        ...prev.slice(0, 4)
      ]);
    }
  }, [events]);

  if (!data) return (
    <div className="flex items-center justify-center h-[70vh]">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-16 h-16 border-2 border-cyber-neon/20 border-t-cyber-neon rounded-full" />
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white/90 uppercase tracking-tighter italic leading-none mb-4">ThreatMatrix Mainnet</h2>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse shadow-[0_0_8px_#39ff14]" />
              <span className="text-[10px] font-black text-cyber-green uppercase tracking-widest">Global Mainnet Active</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{operatorCount} Active SOC Agents</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
           <div className="p-4 bg-white/[0.02] border border-white/10 rounded-2xl flex items-center gap-4">
              <div className="text-right">
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Neural Latency</p>
                 <p className="text-sm font-black text-white">0.02ms</p>
              </div>
              <Wifi className="w-5 h-5 text-cyber-neon animate-pulse" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Neural Detections', value: data.total_threats, icon: ShieldAlert, color: 'text-cyber-neon-red', bg: 'bg-cyber-neon-red/10', border: 'border-cyber-neon-red/10' },
          { label: 'Phishing Vectors', value: data.phishing, icon: MailWarning, color: 'text-cyber-neon', bg: 'bg-cyber-neon/10', border: 'border-cyber-neon/10' },
          { label: 'Fraud Anomalies', value: data.fraud, icon: Activity, color: 'text-cyber-purple', bg: 'bg-cyber-purple/10', border: 'border-cyber-purple/10' },
          { label: 'Fake News Sync', value: data.fake_news, icon: FileText, color: 'text-cyber-green', bg: 'bg-cyber-green/10', border: 'border-cyber-green/10' },
        ].map((stat, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className={`glass-card p-6 border ${stat.border} hover:border-white/20 transition-all group overflow-hidden relative`}>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-3 ${stat.bg} rounded-xl`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="text-[9px] font-black text-cyber-green flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> LIVE</span>
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-4xl font-black text-white italic">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8 border-white/5 bg-black/40 relative overflow-hidden h-[450px]">
           <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-3">
                 <BrainCircuit className="w-6 h-6 text-cyber-neon animate-pulse" />
                 <h3 className="text-xl font-black text-white uppercase tracking-widest italic leading-none">Intelligence Mesh</h3>
              </div>
              
              {/* Mesh Legend Overlay */}
              <div className="flex flex-col gap-2 bg-black/40 backdrop-blur-md p-3 border border-white/10 rounded-xl">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyber-neon" />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Edge Ingress (Cyan)</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyber-purple" />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Neural Core (Purple)</span>
                 </div>
              </div>
           </div>
           
           <canvas ref={canvasRef} width={800} height={300} className="w-full h-[300px] opacity-100" />
           
           <div className="absolute bottom-8 left-8 right-8 flex justify-between relative z-10">
              {['Node Sync', 'Neural Buffer', 'Data Integrity'].map((node, i) => (
                <div key={i} className="px-6 py-2 bg-white/5 border border-white/10 rounded-full flex items-center gap-3">
                   <div className={`w-1.5 h-1.5 rounded-full ${i === 1 ? 'bg-cyber-purple' : 'bg-cyber-neon'} animate-pulse`} />
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{node}</p>
                </div>
              ))}
           </div>
        </div>

        <div className="glass-card p-8 border-white/5 bg-white/[0.01] flex flex-col">
           <div className="flex items-center gap-3 mb-8">
              <ShieldCheck className="w-6 h-6 text-cyber-green" />
              <h3 className="text-lg font-black text-white uppercase tracking-widest italic leading-none">Autonomous Mitigation</h3>
           </div>
           <div className="space-y-4 flex-1">
              <AnimatePresence initial={false}>
                 {mitigationLogs.map((log, idx) => (
                   <motion.div key={log.id + idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-start gap-4 group hover:bg-white/[0.08] transition-all">
                      <div className="p-2 bg-cyber-green/10 rounded-lg"><CheckCircle2 className="w-4 h-4 text-cyber-green" /></div>
                      <div>
                         <p className="text-[10px] font-black text-white leading-tight uppercase group-hover:text-cyber-neon transition-colors">{log.msg}</p>
                         <p className="text-[8px] font-black text-slate-600 uppercase mt-1 tracking-widest">{log.id} • SYNCED</p>
                      </div>
                   </motion.div>
                 ))}
              </AnimatePresence>
           </div>
        </div>
      </div>
    </div>
  );
}
