import React, { useState } from 'react';
import { History as HistoryIcon, Search, Filter, ShieldAlert, MailWarning, FileText, Clock, Trash2, Database, ListFilter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../hooks/useSocket';

export default function History() {
  const { events, data } = useSocket();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'fraud': return <ShieldAlert className="w-5 h-5 text-cyber-purple" />;
      case 'phishing': return <MailWarning className="w-5 h-5 text-cyber-neon" />;
      case 'news': return <FileText className="w-5 h-5 text-cyber-green" />;
      default: return <HistoryIcon className="w-5 h-5 text-slate-400" />;
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.details.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         event.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || event.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const filters = [
    { id: 'all', name: 'ALL LOGS' },
    { id: 'phishing', name: 'PHISHING' },
    { id: 'fraud', name: 'FRAUD' },
    { id: 'news', name: 'FAKE NEWS' },
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-4xl font-black text-white glow-text uppercase tracking-tighter">System Audit Logs</h2>
            <div className="px-3 py-1 bg-cyber-purple/10 border border-cyber-purple/30 rounded-full flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-cyber-purple animate-pulse" />
               <span className="text-[9px] font-black text-cyber-purple uppercase tracking-widest">Master Node: Synchronized</span>
            </div>
          </div>
          <p className="text-slate-400 font-medium">Real-time chronological trace of all AI detections and security scans</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyber-neon transition-colors" />
            <input 
              type="text" 
              placeholder="Search local audit logs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:border-cyber-neon focus:ring-1 focus:ring-cyber-neon/30 transition-all text-white w-72 backdrop-blur-xl"
            />
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`p-3 border rounded-xl transition-all ${showFilterDropdown ? 'bg-cyber-neon/10 border-cyber-neon text-cyber-neon' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'}`}
            >
              <ListFilter className="w-5 h-5" />
            </button>
            
            <AnimatePresence>
              {showFilterDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-48 bg-cyber-black border border-white/10 rounded-2xl p-2 shadow-2xl z-50 backdrop-blur-3xl"
                >
                  {filters.map(f => (
                    <button
                      key={f.id}
                      onClick={() => {
                        setActiveFilter(f.id);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === f.id ? 'bg-cyber-neon/20 text-cyber-neon' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}
                    >
                      {f.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="glass-card p-6 border-white/5 bg-white/[0.02]">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Filtered Logs</p>
            <p className="text-3xl font-black text-white">{filteredEvents.length}</p>
         </div>
         <div className="glass-card p-6 border-white/5 bg-white/[0.02]">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Malicious Targets</p>
            <p className="text-3xl font-black text-cyber-neon-red">{data?.total_threats || 0}</p>
         </div>
         <div className="glass-card p-6 border-white/5 bg-white/[0.02]">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Log Integrity</p>
            <p className="text-3xl font-black text-cyber-green italic underline decoration-cyber-green/30">VERIFIED</p>
         </div>
      </div>

      <div className="glass-card overflow-hidden bg-black/40 backdrop-blur-2xl border-white/10 shadow-2xl">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-40">
            <div className="p-8 bg-white/5 rounded-full w-fit mx-auto mb-6 border border-white/5">
              <Database className="w-16 h-16 text-slate-700" />
            </div>
            <h4 className="text-xl font-black text-slate-500 mb-2 uppercase tracking-widest">No matching logs found</h4>
            <p className="text-sm text-slate-600 max-w-sm mx-auto uppercase font-bold italic">Try adjusting your search query or filter settings</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] text-slate-500 uppercase font-black tracking-widest bg-white/[0.03]">
                  <th className="p-8">Identification</th>
                  <th className="p-8">Threat Type</th>
                  <th className="p-8">Details & Analysis</th>
                  <th className="p-8">Risk Verdict</th>
                  <th className="p-8 text-right">Local Time</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {filteredEvents.map((row) => (
                    <motion.tr 
                      key={row.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-b border-white/5 hover:bg-white/[0.04] transition-all group"
                    >
                      <td className="p-8">
                         <span className="font-mono text-[10px] text-slate-500 group-hover:text-cyber-neon transition-colors">
                            {row.id}
                         </span>
                      </td>
                      <td className="p-8">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-current/50 transition-colors`}>
                            {getTypeIcon(row.type)}
                          </div>
                          <span className="text-white font-black uppercase text-xs tracking-widest">{row.type}</span>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="max-w-md truncate text-slate-300 font-medium text-sm">
                          {row.details}
                        </div>
                      </td>
                      <td className="p-8">
                        <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-xl border ${
                          row.risk === 'High' || row.risk === 'Critical'
                          ? 'bg-cyber-neon-red/10 text-cyber-neon-red border-cyber-neon-red/40'
                          : row.risk === 'Medium' 
                          ? 'bg-amber-400/10 text-amber-400 border-amber-400/40'
                          : 'bg-cyber-green/10 text-cyber-green border-cyber-green/40'
                        }`}>
                          {row.risk || 'Low'}
                        </span>
                      </td>
                      <td className="p-8 text-right font-mono text-xs text-slate-500">
                         {row.time}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
