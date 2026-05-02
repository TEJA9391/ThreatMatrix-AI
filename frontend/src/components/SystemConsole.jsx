import React, { useState, useEffect, useRef } from 'react';
import { Terminal, X, ChevronUp, ChevronDown, Activity, Cpu, Database, Globe, Maximize2, Minimize2, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../hooks/useSocket';
import { useUser } from '../context/UserContext';

export default function SystemConsole() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [command, setCommand] = useState('');
  const { events, isConnected } = useSocket();
  const { user } = useUser();
  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), msg: 'CyberShield Kernel v2.5 Initialized...', type: 'sys' },
    { time: new Date().toLocaleTimeString(), msg: 'Secure WebSocket handshake successful on Port 5001.', type: 'sys' },
    { time: new Date().toLocaleTimeString(), msg: 'All security nodes reporting ACTIVE status.', type: 'sys' },
  ]);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (events.length > 0) {
      const lastEvent = events[0];
      setLogs(prev => [...prev, {
        time: lastEvent.time,
        msg: `[DETECTION] ${lastEvent.type.toUpperCase()}: ${lastEvent.details} (Risk: ${lastEvent.risk})`,
        type: 'event'
      }].slice(-100));
    }
  }, [events]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isOpen, isFull]);

  const handleCommand = (e) => {
    e.preventDefault();
    if (!command) return;

    const cmd = command.toLowerCase().trim();
    const newLogs = [...logs, { time: new Date().toLocaleTimeString(), msg: `> ${command}`, type: 'input' }];

    switch(cmd) {
      case 'help':
        newLogs.push({ time: new Date().toLocaleTimeString(), msg: 'Available Commands: CLEAR, HELP, WHOAMI, STATUS, SCAN, NEURAL_PURGE', type: 'sys' });
        break;
      case 'clear':
        setLogs([{ time: new Date().toLocaleTimeString(), msg: 'Console buffer cleared.', type: 'sys' }]);
        setCommand('');
        return;
      case 'whoami':
        newLogs.push({ time: new Date().toLocaleTimeString(), msg: `USER: ${user.name} | ROLE: ${user.role} | CLEARANCE: Level ${user.level}`, type: 'sys' });
        break;
      case 'status':
        newLogs.push({ time: new Date().toLocaleTimeString(), msg: `SYSTEM STATUS: ${isConnected ? 'ONLINE' : 'OFFLINE'} | LATENCY: 0.2ms | NODES: 24`, type: 'sys' });
        break;
      case 'scan':
        newLogs.push({ time: new Date().toLocaleTimeString(), msg: 'Initializing system-wide deep scan...', type: 'sys' });
        setTimeout(() => {
          setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: 'Scan Complete: 0 High-level vulnerabilities found in core kernel.', type: 'sys' }]);
        }, 1500);
        break;
      default:
        newLogs.push({ time: new Date().toLocaleTimeString(), msg: `ERROR: Command '${cmd}' not recognized in this terminal session.`, type: 'error' });
    }

    setLogs(newLogs.slice(-100));
    setCommand('');
  };

  return (
    <div className={`fixed bottom-0 right-10 z-[60] transition-all duration-500 ${isFull ? 'inset-x-0 bottom-0 right-0 left-64' : 'w-[550px]'}`}>
      {/* Console Toggle Header */}
      <div 
        className={`bg-cyber-black/95 border-t border-x border-white/10 rounded-t-xl px-6 py-3 flex items-center justify-between backdrop-blur-3xl group cursor-default transition-all ${isOpen ? 'border-cyber-neon/30' : 'hover:border-cyber-neon/50'}`}
      >
        <div className="flex items-center gap-4" onClick={() => setIsOpen(!isOpen)} className="cursor-pointer flex items-center gap-4 flex-1">
          <Terminal className={`w-4 h-4 ${isConnected ? 'text-cyber-neon' : 'text-cyber-red'} ${isOpen ? 'animate-pulse' : ''}`} />
          <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
            System Kernel Terminal <span className="text-slate-600 font-mono">v2.5_stable</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
           {isOpen && (
             <button onClick={() => setIsFull(!isFull)} className="p-1 hover:bg-white/5 rounded transition-colors">
               {isFull ? <Minimize2 className="w-3.5 h-3.5 text-slate-400" /> : <Maximize2 className="w-3.5 h-3.5 text-slate-400" />}
             </button>
           )}
           <div className="flex items-center gap-2" onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
              {isOpen ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronUp className="w-4 h-4 text-slate-500" />}
           </div>
        </div>
      </div>

      {/* Console Body */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: isFull ? '60vh' : 350 }}
            exit={{ height: 0 }}
            className="bg-black/98 border-x border-white/10 overflow-hidden backdrop-blur-3xl flex flex-col shadow-[0_-20px_60px_rgba(0,0,0,0.8)] relative"
          >
            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-20 opacity-20" />
            
            <div className="flex-1 overflow-y-auto p-6 font-mono text-[10px] space-y-2 custom-scrollbar relative z-10" ref={scrollRef}>
               {logs.map((log, idx) => (
                 <div key={idx} className="flex gap-4 group">
                    <span className="text-slate-700 shrink-0 select-none">[{log.time}]</span>
                    <span className={`break-all ${
                      log.type === 'event' ? 'text-cyber-neon shadow-[0_0_8px_rgba(0,243,255,0.2)]' : 
                      log.type === 'input' ? 'text-cyber-purple font-black' :
                      log.type === 'error' ? 'text-cyber-red' :
                      'text-slate-300'
                    } group-hover:text-white transition-colors`}>
                       <span className="text-slate-600 mr-2">{log.type === 'input' ? 'λ' : '➜'}</span>
                       {log.msg}
                    </span>
                 </div>
               ))}
               <div className="flex gap-4 items-center pt-2">
                  <span className="text-slate-700">[{new Date().toLocaleTimeString()}]</span>
                  <span className="text-cyber-purple font-black mr-2">λ</span>
                  <form onSubmit={handleCommand} className="flex-1">
                    <input 
                      ref={inputRef}
                      autoFocus
                      type="text" 
                      value={command}
                      onChange={(e) => setCommand(e.target.value)}
                      placeholder="Type command (HELP for list)..."
                      className="bg-transparent border-none outline-none text-white w-full placeholder:text-slate-800"
                    />
                  </form>
               </div>
            </div>
            
            {/* System Monitor Footer */}
            <div className="h-12 bg-white/5 border-t border-white/5 flex items-center justify-between px-6 shrink-0 relative z-10">
               <div className="flex gap-8">
                  <div className="flex items-center gap-2">
                     <Cpu className="w-3 h-3 text-cyber-purple" />
                     <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">CPU: 04.2%</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <Database className="w-3 h-3 text-cyber-blue" />
                     <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">MEM: 128MB</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <Globe className="w-3 h-3 text-cyber-neon" />
                     <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">WS: Connected</span>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <span className="text-[9px] font-black text-cyber-green uppercase tracking-widest animate-pulse">Kernel Running</span>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
