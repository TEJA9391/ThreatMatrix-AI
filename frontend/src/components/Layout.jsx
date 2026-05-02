import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Background from './Background';
import SystemConsole from './SystemConsole';
import { useSocket } from '../hooks/useSocket';
import { useUser } from '../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X, Zap } from 'lucide-react';

export default function Layout({ children }) {
  const { events } = useSocket();
  const { user } = useUser();
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (user.notifications && events.length > 0) {
      const latest = events[0];
      if (latest.risk === 'High' || latest.risk === 'Critical' || latest.risk === 'Medium') {
        setNotification(latest);
        const timer = setTimeout(() => setNotification(null), 6000);
        return () => clearTimeout(timer);
      }
    }
  }, [events, user.notifications]);

  return (
    <div className="min-h-screen bg-cyber-black text-slate-300 font-sans selection:bg-cyber-neon/30 selection:text-white relative">
      <Background />
      <Sidebar />
      
      {/* Content Wrapper - Shifted by Sidebar Width (64) */}
      <div className="pl-64 min-h-screen flex flex-col relative z-10">
        <Navbar />
        
        {/* Scrollable Main Area */}
        <main className="flex-1 pt-32 pb-20">
          <div className="px-10 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>

        <SystemConsole />
      </div>

      {/* Real-time Global Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ x: 400, opacity: 0, scale: 0.9 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 400, opacity: 0, scale: 0.9 }}
            className={`fixed top-32 right-10 z-[100] w-96 bg-cyber-black/90 border rounded-2xl p-5 backdrop-blur-3xl shadow-2xl group overflow-hidden ${
              notification.risk === 'High' || notification.risk === 'Critical' 
              ? 'border-cyber-neon-red/40 shadow-[0_0_40px_rgba(255,49,49,0.1)]' 
              : 'border-amber-400/40 shadow-[0_0_40px_rgba(251,191,36,0.1)]'
            }`}
          >
            <motion.div 
              animate={{ opacity: [0, 0.2, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className={`absolute inset-0 z-0 ${notification.risk === 'High' || notification.risk === 'Critical' ? 'bg-cyber-neon-red' : 'bg-amber-400'}`}
            />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${notification.risk === 'High' || notification.risk === 'Critical' ? 'bg-cyber-neon-red/10' : 'bg-amber-400/10'}`}>
                    <ShieldAlert className={`w-5 h-5 ${notification.risk === 'High' || notification.risk === 'Critical' ? 'text-cyber-neon-red' : 'text-amber-400'} animate-pulse`} />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${notification.risk === 'High' || notification.risk === 'Critical' ? 'text-cyber-neon-red' : 'text-amber-400'}`}>
                    {notification.risk} Risk Detected
                  </span>
                </div>
                <button onClick={() => setNotification(null)} className="text-slate-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex items-start gap-4">
                 <div className="flex-1">
                    <p className="text-sm font-black text-white mb-1 uppercase italic tracking-tighter leading-none">{notification.type} Anomaly Logged</p>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-2 leading-relaxed">{notification.details}</p>
                 </div>
                 <Zap className={`w-8 h-8 opacity-10 ${notification.risk === 'High' || notification.risk === 'Critical' ? 'text-cyber-neon-red' : 'text-amber-400'}`} />
              </div>
              <div className="mt-5 pt-3 border-t border-white/5 flex justify-between items-center">
                <span className="text-[9px] font-mono text-slate-600">{notification.id}</span>
                <button onClick={() => setNotification(null)} className={`text-[9px] font-black uppercase hover:underline ${notification.risk === 'High' || notification.risk === 'Critical' ? 'text-cyber-neon-red' : 'text-amber-400'}`}>Confirm Awareness</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
