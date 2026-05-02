import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, ShieldAlert, MailWarning, FileText, 
  BarChart3, History, ShieldCheck, Bell, Settings, 
  User, MoreVertical, Activity, Zap, Cpu, Lock, ShieldX, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../hooks/useSocket';
import { useUser } from '../context/UserContext';

const navItems = [
  { path: '/', name: 'Dashboard', icon: LayoutDashboard },
  { path: '/fraud', name: 'Fraud Detection', icon: ShieldAlert },
  { path: '/phishing', name: 'Phishing Detection', icon: MailWarning },
  { path: '/fake-news', name: 'Fake News Detection', icon: FileText },
  { path: '/analytics', name: 'Analytics', icon: BarChart3 },
  { path: '/history', name: 'History', icon: History },
  { path: '/about', name: 'About & Contact', icon: Info },
];

export default function Sidebar() {
  const { isConnected, events } = useSocket();
  const { user } = useUser();
  const [pulse, setPulse] = useState(false);
  const [blocklist, setBlocklist] = useState([
    { ip: '192.168.45.1', time: '2m ago', risk: 'High' },
    { ip: '45.128.90.12', time: '5m ago', risk: 'Critical' },
    { ip: '103.45.1.1', time: '12m ago', risk: 'Medium' },
    { ip: '212.89.0.4', time: '15m ago', risk: 'High' },
    { ip: '8.8.4.4', time: '18m ago', risk: 'Critical' },
  ]);

  useEffect(() => {
    if (events.length > 0) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 300);
      
      const newIp = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      const risks = ['High', 'Critical', 'Medium'];
      const newBlock = { 
        ip: newIp, 
        time: 'Just Now', 
        risk: risks[Math.floor(Math.random() * risks.length)] 
      };
      
      setBlocklist(prev => [newBlock, ...prev.slice(0, 9)]);
      return () => clearTimeout(timer);
    }
  }, [events]);

  return (
    <aside className="w-64 h-screen bg-cyber-black/40 backdrop-blur-3xl border-r border-white/5 flex flex-col fixed left-0 top-0 z-50 overflow-hidden">
      {/* Sidebar Header */}
      <div className="p-8 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-4 group cursor-pointer">
          <div className="relative">
            <div className={`absolute inset-0 bg-cyber-neon blur-[10px] rounded-lg transition-opacity duration-300 ${pulse ? 'opacity-100' : 'opacity-40 group-hover:opacity-60'}`} />
            <div className={`relative p-2 bg-cyber-neon/10 rounded-lg border border-cyber-neon/30 transition-all ${pulse ? 'scale-110 border-cyber-neon' : ''}`}>
              <ShieldCheck className="w-6 h-6 text-cyber-neon" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white leading-none uppercase">
              THREAT<span className="text-cyber-neon">MATRIX</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">AI SOC CORE</p>
          </div>
        </div>
      </div>

      {/* Main Navigation - Scrollable */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-2 space-y-8">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group
                ${isActive 
                  ? 'bg-cyber-neon/10 text-white shadow-[inset_0_0_20px_rgba(0,243,255,0.05)]' 
                  : 'text-slate-500 hover:text-white hover:bg-white/5'}
              `}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]`} />
                  <span className="text-sm font-bold tracking-wide">{item.name}</span>
                  <div className={`absolute left-0 w-1 h-6 bg-cyber-neon rounded-r-full blur-[2px] transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Live IP Blocklist - Nested Scrollable */}
        <div className="space-y-4 pb-4">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <ShieldX className="w-3.5 h-3.5 text-cyber-neon-red" /> Live IP Blocklist
              </h3>
              <div className="w-1.5 h-1.5 rounded-full bg-cyber-neon-red animate-pulse" />
           </div>
           <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
              <AnimatePresence initial={false}>
                 {blocklist.map((item, idx) => (
                   <motion.div 
                     key={item.ip + idx}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: 20 }}
                     className="p-3 bg-white/5 border border-white/5 rounded-xl group hover:border-cyber-neon-red/30 transition-all cursor-crosshair"
                   >
                      <div className="flex justify-between items-center mb-1">
                         <span className="text-[10px] font-mono text-white group-hover:text-cyber-neon-red transition-colors">{item.ip}</span>
                         <span className="text-[8px] font-black text-slate-600 uppercase">{item.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-1.5">
                            <div className={`w-1 h-1 rounded-full ${item.risk === 'Critical' ? 'bg-cyber-neon-red' : 'bg-amber-500'}`} />
                            <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">{item.risk} Risk</span>
                         </div>
                         <span className="text-[7px] font-black text-cyber-neon-red uppercase">Auto-Blocked</span>
                      </div>
                   </motion.div>
                 ))}
              </AnimatePresence>
           </div>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-6 shrink-0 space-y-4 border-t border-white/5">
        <div className="px-4 py-4 glass-card border-white/5 bg-white/[0.02] rounded-2xl relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-2 h-2 rounded-full transition-all duration-500 ${isConnected ? 'bg-cyber-green animate-pulse shadow-[0_0_8px_#39ff14]' : 'bg-cyber-red shadow-[0_0_10px_rgba(255,0,60,0.5)]'}`} />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mainnet Synced</p>
          </div>
          <div className="flex justify-between items-end">
             <p className="text-[11px] text-white font-black italic tracking-tighter uppercase leading-none">Kernel Online</p>
             <Zap className={`w-4 h-4 text-cyber-neon ${pulse ? 'scale-125 opacity-100' : 'opacity-30'} transition-all`} />
          </div>
        </div>

        <NavLink to="/profile" className="flex items-center justify-between px-2 group">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-cyber-purple blur-[5px] opacity-0 group-hover:opacity-40 transition-opacity rounded-lg" />
              <div className="w-8 h-8 rounded-lg bg-cyber-purple/10 border border-cyber-purple/30 flex items-center justify-center overflow-hidden relative">
                 <img src={user.avatar} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white group-hover:text-cyber-neon transition-colors uppercase italic tracking-tighter">{user.name}</p>
              <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">LV. {user.level} AUTHORIZED</p>
            </div>
          </div>
          <Activity className={`w-3.5 h-3.5 text-cyber-purple transition-opacity ${pulse ? 'opacity-100' : 'opacity-30'}`} />
        </NavLink>
      </div>
    </aside>
  );
}
