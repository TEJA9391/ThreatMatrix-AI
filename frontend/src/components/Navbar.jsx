import React, { useState, useEffect } from 'react';
import { 
  Bell, User, Search, Terminal, Maximize, Cpu, Activity, X, 
  ShieldAlert, MailWarning, FileText, BarChart3, 
  History as HistoryIcon, LayoutDashboard, Settings, 
  LogOut, Trash2, ShieldCheck, Zap, UserCircle, Inbox, Clock,
  Trophy, Globe, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { useUser } from '../context/UserContext';
import axios from 'axios';

export default function Navbar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [purging, setPurging] = useState(false);
  const [securityScore, setSecurityScore] = useState(98.4);
  const [tickerIndex, setTickerIndex] = useState(0);
  const { events, data } = useSocket();
  const { user } = useUser();
  const navigate = useNavigate();

  const tickerNews = [
    "ZERO-DAY ALERT: New exploit detected in OpenSSL core - Patches deployed.",
    "INTEL REPORT: APT-29 infrastructure spotted in Asian region - Monitor port 443.",
    "SYSTEM STATUS: All neural nodes operating at 99.9% efficiency.",
    "BLOCKLIST SYNC: 1,420 new malicious IPs synchronized with global firewall.",
    "THREAT LEVEL: Elevated activity detected in decentralized finance nodes."
  ];

  useEffect(() => {
    const scoreInterval = setInterval(() => {
      setSecurityScore(prev => +(prev + (Math.random() > 0.5 ? 0.1 : -0.1)).toFixed(1));
    }, 4000);
    const tickerInterval = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % tickerNews.length);
    }, 6000);
    return () => { clearInterval(scoreInterval); clearInterval(tickerInterval); };
  }, []);

  const handleResultClick = (path) => {
    navigate(path);
    setSearchTerm('');
    setShowResults(false);
  };

  return (
    <>
      {/* Global Intelligence Ticker */}
      <div className="fixed top-0 left-64 right-0 h-8 bg-cyber-black/80 backdrop-blur-3xl border-b border-cyber-neon/20 z-[60] flex items-center px-6 overflow-hidden">
        <div className="flex items-center gap-3 shrink-0 mr-6">
           <Globe className="w-3.5 h-3.5 text-cyber-neon" />
           <span className="text-[9px] font-black text-cyber-neon uppercase tracking-widest">Global Intel:</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.p 
            key={tickerIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-[10px] font-bold text-white/60 italic tracking-wide"
          >
            {tickerNews[tickerIndex]}
          </motion.p>
        </AnimatePresence>
        <div className="ml-auto flex items-center gap-4">
           <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse" />
              <span className="text-[9px] font-black text-cyber-green/70 uppercase">Sync Active</span>
           </div>
        </div>
      </div>

      <header className="h-20 bg-cyber-black/60 backdrop-blur-2xl border-b border-white/5 fixed top-8 right-0 left-64 z-50 px-10 flex items-center justify-between">
        <div className="flex items-center gap-6 flex-1 relative">
          <div className="relative w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Deep Search Kernel..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowResults(true)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-12 pr-4 text-sm focus:outline-none focus:border-cyber-neon/30 transition-all font-medium"
            />
          </div>

          <div className="flex items-center gap-4">
             {/* SOC Performance Meter - Subtle Glow */}
             <div className="flex items-center gap-4 px-4 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex flex-col">
                   <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">SOC Score</span>
                   <div className="flex items-center gap-2">
                      <Trophy className="w-3.5 h-3.5 text-cyber-neon/80" />
                      <span className="text-sm font-black text-white italic tracking-tighter">{securityScore}%</span>
                   </div>
                </div>
                <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                   <motion.div 
                    animate={{ width: `${securityScore}%` }}
                    className="h-full bg-cyber-neon/60"
                   />
                </div>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button onClick={() => document.documentElement.requestFullscreen()} className="p-2.5 text-slate-500 hover:text-white transition-all"><Maximize className="w-5 h-5" /></button>
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2.5 transition-all rounded-xl ${showNotifications ? 'bg-cyber-neon/5 text-cyber-neon' : 'text-slate-500 hover:text-cyber-neon'}`}
              >
                <Bell className="w-5 h-5" />
                {events.length > 0 && (
                  <span className="absolute top-2 right-2 w-3.5 h-3.5 bg-cyber-neon-red/80 text-[8px] font-black text-white rounded-full flex items-center justify-center border-2 border-cyber-black">
                    {events.length > 9 ? '9+' : events.length}
                  </span>
                )}
              </button>
            </div>
          </div>
          
          <div className="h-8 w-[1px] bg-white/10" />

          <div className="relative">
            <div onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-4 pl-2 group cursor-pointer">
              <div className="text-right">
                <p className="text-sm font-black text-white/90 leading-none group-hover:text-cyber-neon transition-colors uppercase italic tracking-tighter">{user.name}</p>
                <p className="text-[9px] text-cyber-purple/80 font-black mt-1 uppercase tracking-widest">LVL {user.level} ADMIN</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyber-blue border border-white/10 flex items-center justify-center overflow-hidden relative">
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
