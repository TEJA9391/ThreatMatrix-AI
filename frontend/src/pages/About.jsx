import React from 'react';
import { 
  ShieldCheck, Globe, Cpu, Mail, MapPin, 
  Zap, Database, Terminal, 
  Users, Award, Shield, Activity, Lock, 
  ChevronRight, ArrowUpRight, User, Code
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function About() {
  const technologies = [
    { name: 'Neural Kernel', icon: Cpu, desc: 'Advanced AI Inference Engine' },
    { name: 'Socket Mainnet', icon: Zap, desc: 'Real-time Telemetry Synchronization' },
    { name: 'Core Interface', icon: Code, desc: 'High-fidelity React 18 UI' },
    { name: 'Secure Vault', icon: Lock, desc: 'Zero-Trust Protocol Implementation' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-20 pb-32 relative px-4"
    >
      {/* Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyber-neon/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-cyber-purple/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Advanced Hero Section */}
      <div className="relative glass-card p-12 lg:p-20 items-center bg-black/40 overflow-hidden rounded-[2.5rem] border-white/5 shadow-2xl">
         <div className="absolute inset-0 bg-gradient-to-br from-cyber-neon/5 via-transparent to-cyber-purple/5 pointer-events-none" />
         <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-cyber-neon/10 rounded-2xl flex items-center justify-center border border-cyber-neon/20">
                     <ShieldCheck className="w-6 h-6 text-cyber-neon" />
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">THREATMATRIX v2.5</span>
               </div>
               
               <h1 className="text-6xl lg:text-8xl font-black text-white italic tracking-tighter leading-none mb-8 uppercase">
                  THE FUTURE <br /> OF <span className="text-cyber-neon drop-shadow-[0_0_20px_rgba(0,243,255,0.3)]">THREAT AI</span>
               </h1>
               
               <p className="text-lg text-slate-400 font-medium italic leading-relaxed max-w-xl mb-12 border-l-4 border-cyber-neon/30 pl-8">
                  At ThreatMatrix AI, we don't just detect threats. We visualize the digital battlefield, turning complex neural telemetry into actionable defensive insight.
               </p>

               <div className="flex flex-wrap gap-6">
                  <a href="https://github.com/TEJA9391" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-cyber-neon text-black font-black uppercase tracking-widest rounded-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all cursor-pointer">
                     View Source <ArrowUpRight className="w-4 h-4" />
                  </a>
                  <button className="px-8 py-4 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all cursor-pointer">
                     Intel Status
                  </button>
               </div>
            </div>

            <div className="relative group">
               <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl aspect-[4/3] bg-black/40">
                  <img 
                    src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800" 
                    className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-1000" 
                    alt="Threat Interface"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <div className="absolute bottom-8 left-8 right-8">
                     <div className="glass-card p-5 border-white/10 bg-black/60 backdrop-blur-md">
                        <div className="flex items-center gap-3 mb-2">
                           <Activity className="w-4 h-4 text-cyber-neon animate-pulse" />
                           <span className="text-[9px] font-black text-white uppercase tracking-widest">Threat Matrix: ACTIVE</span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 italic">Neural Matrix v4.2.0-Alpha</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Profile & Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="glass-card p-12 bg-black/60 border-white/5 relative overflow-hidden group">
            <div className="relative mb-12">
               <div className="absolute inset-0 bg-cyber-purple/20 blur-3xl rounded-full" />
               <div className="w-36 h-36 rounded-[2.5rem] bg-gradient-to-tr from-cyber-blue to-cyber-purple p-[2px] relative z-10 mx-auto lg:mx-0">
                  <div className="w-full h-full rounded-[2.4rem] bg-black overflow-hidden relative">
                     <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400" className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500" />
                  </div>
               </div>
               <div className="absolute -bottom-2 right-1/2 lg:right-4 translate-x-1/2 lg:translate-x-0 w-12 h-12 bg-cyber-purple rounded-2xl border-4 border-cyber-black flex items-center justify-center shadow-2xl z-20">
                  <Award className="w-5 h-5 text-white" />
               </div>
            </div>

            <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2 text-center lg:text-left">BOORA RAVITEJA</h3>
            <p className="text-[10px] font-black text-cyber-purple uppercase tracking-[0.4em] mb-10 text-center lg:text-left">Chief System Architect</p>
            
            <div className="space-y-3">
               {[
                 { icon: Mail, val: 'raviteja@threatmatrix.ai', label: 'OFFICIAL_EMAIL' },
                 { icon: MapPin, val: 'HYDERABAD, INDIA', label: 'SOC_LOCATION' },
                 { icon: Globe, val: 'threatmatrix.ai', label: 'SYSTEM_URL' },
               ].map((info, i) => (
                 <div key={i} className="flex items-center gap-5 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                    <info.icon className="w-4 h-4 text-cyber-neon shrink-0" />
                    <div>
                       <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">{info.label}</p>
                       <p className="text-xs font-bold text-slate-300">{info.val}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {technologies.map((tech, idx) => (
                  <div key={idx} className="glass-card p-8 bg-white/[0.02] border-white/5 group hover:border-cyber-neon/30 transition-all">
                     <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-cyber-neon/10 transition-colors">
                        <tech.icon className="w-6 h-6 text-slate-500 group-hover:text-cyber-neon transition-colors" />
                     </div>
                     <h4 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">{tech.name}</h4>
                     <p className="text-sm text-slate-500 font-medium leading-relaxed italic">{tech.desc}</p>
                  </div>
               ))}

               <div className="glass-card p-10 bg-white/[0.02] border-white/5 md:col-span-2 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                     <Activity className="w-40 h-40 text-white" />
                  </div>
                  <div className="flex items-center gap-6 mb-8">
                     <div className="p-4 bg-cyber-green/10 rounded-2xl border border-cyber-green/20">
                        <Activity className="w-8 h-8 text-cyber-green" />
                     </div>
                     <div>
                        <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter">Direct Signal</h4>
                        <p className="text-xs font-black text-cyber-green uppercase tracking-widest">Secure Terminal</p>
                     </div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                     <a href="https://github.com/TEJA9391" target="_blank" rel="noopener noreferrer" className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
                        <User className="w-4 h-4" /> GITHUB_CORE
                     </a>
                     <a href="https://linkedin.com/in/raviteja-boora" target="_blank" rel="noopener noreferrer" className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
                        <User className="w-4 h-4" /> LINKEDIN_AUTH
                     </a>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-20">
         <h2 className="text-2xl font-black text-white/5 uppercase tracking-[0.5em] italic mb-4">THREATMATRIX INTELLIGENCE</h2>
         <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">
            (c) 2026 GLOBAL SOC MAINNET | ARCHITECTED BY BOORA RAVITEJA
         </p>
      </div>
    </motion.div>
  );
}
