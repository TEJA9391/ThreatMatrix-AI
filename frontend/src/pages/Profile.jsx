import React, { useState, useRef } from 'react';
import { 
  User, ShieldCheck, Zap, Bell, Lock, Key, Globe, 
  Camera, CheckCircle2, AlertTriangle, Cpu, Mail, 
  Terminal, ExternalLink, Settings, Save, X, RotateCw, Image, Upload, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../hooks/useSocket';
import { useUser } from '../context/UserContext';

export default function Profile() {
  const { events } = useSocket();
  const { user, updateUser } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...user });
  const fileInputRef = useRef(null);

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Identity Overview', icon: User },
    { id: 'security', name: 'Access & Security', icon: Lock },
    { id: 'preferences', name: 'System Preferences', icon: Settings },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Header Profile Card */}
      <div className="relative glass-card p-10 overflow-hidden group border-white/5 bg-black/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyber-purple/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="relative group/avatar">
            <div className="absolute inset-0 bg-cyber-purple blur-[20px] opacity-20 group-hover:opacity-40 transition-opacity rounded-full" />
            <div className="w-40 h-40 rounded-3xl bg-cyber-blue border-2 border-white/10 p-1 relative overflow-hidden">
               <img src={user.avatar} className="w-full h-full object-cover rounded-2xl opacity-90 transition-transform group-hover:scale-105 duration-700" />
               <div 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all cursor-pointer"
               >
                  <Camera className="w-6 h-6 text-white mb-2" />
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">Update Matrix</span>
               </div>
            </div>
            <div className={`absolute -top-3 -right-3 w-10 h-10 rounded-xl border-4 border-cyber-black flex items-center justify-center shadow-xl transition-colors ${user.stealthMode ? 'bg-slate-700 text-slate-400' : 'bg-cyber-green text-black'}`}>
               <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
             <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase">{user.name}</h2>
                <div className="px-3 py-1.5 bg-cyber-purple/20 border border-cyber-purple/40 rounded-lg text-[10px] font-black text-cyber-purple uppercase tracking-widest w-fit mx-auto md:mx-0">
                   Level {user.level} Authorization
                </div>
             </div>
             <p className="text-slate-400 max-w-2xl text-sm font-medium leading-relaxed mb-6 italic border-l-2 border-cyber-purple/30 pl-4">
                {user.bio}
             </p>
             <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                   <Mail className="w-3.5 h-3.5" /> {user.email}
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-cyber-green bg-cyber-green/5 px-4 py-2 rounded-full border border-cyber-green/20">
                   <CheckCircle2 className="w-3.5 h-3.5" /> ROLE: {user.role.toUpperCase()}
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-3">
           {tabs.map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${activeTab === tab.id ? 'bg-cyber-neon/10 border-cyber-neon/30 text-cyber-neon shadow-[0_0_20px_rgba(0,243,255,0.1)]' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10'}`}
             >
               <tab.icon className="w-5 h-5" />
               <span className="text-sm font-black uppercase tracking-widest">{tab.name}</span>
             </button>
           ))}
        </div>

        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
             {activeTab === 'overview' && (
               <motion.div key="overview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                  <div className="glass-card p-10 space-y-8 relative overflow-hidden bg-black/40 border-white/5">
                     <div className="flex items-center justify-between relative z-10">
                        <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
                           <User className="w-5 h-5 text-cyber-neon" /> Operational Identity Profile
                        </h3>
                        <button 
                          onClick={() => { setIsEditing(!isEditing); setFormData({...user}); }} 
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isEditing ? 'bg-cyber-red/10 text-cyber-red border-cyber-red/30' : 'bg-cyber-neon/10 text-cyber-neon border-cyber-neon/30 hover:bg-cyber-neon/20'}`}
                        >
                           {isEditing ? <><X className="w-3 h-3" /> Abort Session</> : <><Settings className="w-3 h-3" /> Edit Profile</>}
                        </button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Alias</label>
                           {isEditing ? (
                             <input type="text" className="w-full cyber-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                           ) : (
                             <p className="text-xl font-black text-white italic py-2 border-b border-white/5">{user.name}</p>
                           )}
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Profile Matrix (Upload Photo)</label>
                           {isEditing ? (
                             <div className="flex items-center gap-4">
                                <button 
                                  onClick={() => fileInputRef.current?.click()}
                                  className="flex-1 flex items-center justify-center gap-3 bg-white/5 border border-dashed border-white/20 rounded-xl py-2.5 px-4 text-[10px] font-black text-slate-400 hover:border-cyber-neon hover:text-white transition-all uppercase tracking-widest"
                                >
                                   <Upload className="w-4 h-4" /> Upload New Image
                                </button>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                {formData.avatar && (
                                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10">
                                     <img src={formData.avatar} className="w-full h-full object-cover" />
                                  </div>
                                )}
                             </div>
                           ) : (
                             <p className="text-[10px] font-mono text-slate-500 truncate py-2 border-b border-white/5 italic">Matrix Synced (Local File)</p>
                           )}
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operational Role</label>
                           {isEditing ? (
                             <select className="w-full cyber-input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                <option>Super Admin</option>
                                <option>Security Analyst</option>
                                <option>Kernel Developer</option>
                             </select>
                           ) : (
                             <p className="text-xl font-black text-white italic py-2 border-b border-white/5">{user.role}</p>
                           )}
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Clearance</label>
                           {isEditing ? (
                             <input type="number" className="w-full cyber-input" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} />
                           ) : (
                             <p className="text-xl font-black text-white italic py-2 border-b border-white/5">LEVEL {user.level}</p>
                           )}
                        </div>
                        <div className="md:col-span-2 space-y-3">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Professional Directives (Bio)</label>
                           {isEditing ? (
                             <textarea rows={3} className="w-full cyber-input" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
                           ) : (
                             <p className="text-sm font-medium text-slate-300 py-2 leading-relaxed italic">{user.bio}</p>
                           )}
                        </div>
                     </div>

                     {isEditing && (
                       <motion.button 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        onClick={handleSave} 
                        className="w-full py-5 bg-cyber-neon text-black font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_30px_rgba(0,243,255,0.3)] flex items-center justify-center gap-3 hover:scale-[1.02] transition-all"
                       >
                          <Save className="w-5 h-5" /> SYNCHRONIZE IDENTITY DATA
                       </motion.button>
                     )}
                  </div>
               </motion.div>
             )}

             {activeTab === 'security' && (
               <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  {[
                    { title: 'Neural 2FA Authorization', desc: 'Secure your login with biometric or TOTP secondary layer', status: user.twoFactor, icon: Key, key: 'twoFactor' },
                    { title: 'Identity Stealth Mode', desc: 'Hide administrative activity from lower-level kernel logs', status: user.stealthMode, icon: ShieldCheck, key: 'stealthMode' },
                    { title: 'Neural Key Rotation', desc: 'Automatically rotate encryption keys every 24 hours', status: user.keyRotation, icon: RotateCw, key: 'keyRotation' },
                    { title: 'Admin Console Root', desc: 'Direct root access to CyberShield core kernels', status: user.adminConsole, icon: Terminal, key: 'adminConsole' },
                  ].map((item, idx) => (
                    <div key={idx} className="glass-card p-6 flex items-center justify-between group hover:border-cyber-purple/30 transition-all bg-black/40">
                       <div className="flex items-center gap-6">
                          <div className={`p-3 bg-white/5 rounded-xl transition-colors ${item.status ? 'text-cyber-purple' : 'text-slate-400 group-hover:text-cyber-purple'}`}>
                             <item.icon className={`w-6 h-6 ${item.status && item.key === 'keyRotation' ? 'animate-spin-slow' : ''}`} />
                          </div>
                          <div><p className="text-sm font-black text-white uppercase tracking-widest">{item.title}</p><p className="text-xs text-slate-500">{item.desc}</p></div>
                       </div>
                       <button onClick={() => updateUser({ [item.key]: !user[item.key] })} className={`w-14 h-7 rounded-full relative cursor-pointer transition-all duration-300 ${item.status ? 'bg-cyber-purple shadow-[0_0_15px_rgba(188,19,254,0.4)]' : 'bg-white/10'}`}>
                          <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-300 ${item.status ? 'right-1' : 'left-1'}`} />
                       </button>
                    </div>
                  ))}
               </motion.div>
             )}

             {activeTab === 'preferences' && (
               <motion.div key="preferences" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="glass-card p-10 space-y-10 bg-black/40">
                     <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
                        <Settings className="w-5 h-5 text-cyber-neon" /> System Interface Preferences
                     </h3>
                     <div className="space-y-8">
                        <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                           <div className="flex items-center gap-4">
                              <Bell className={`w-5 h-5 ${user.notifications ? 'text-cyber-neon' : 'text-slate-600'}`} />
                              <div><p className="text-sm font-black text-white uppercase">Real-time Stream Notifications</p><p className="text-xs text-slate-500 font-medium">Audio and visual priority alerts for high-risk detections</p></div>
                           </div>
                           <button onClick={() => updateUser({ notifications: !user.notifications })} className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all ${user.notifications ? 'bg-cyber-neon border-cyber-neon text-black' : 'border-slate-700 text-transparent'}`}><CheckCircle2 className="w-4 h-4" /></button>
                        </div>
                        <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                           <div className="flex items-center gap-4">
                              <Zap className={`w-5 h-5 ${user.socPurge ? 'text-cyber-red' : 'text-slate-600'}`} />
                              <div><p className="text-sm font-black text-white uppercase">Automated SOC Purge</p><p className="text-xs text-slate-500 font-medium">Clear system logs and buffers every 60 minutes automatically</p></div>
                           </div>
                           <button onClick={() => updateUser({ socPurge: !user.socPurge })} className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all ${user.socPurge ? 'bg-cyber-red border-cyber-red text-black' : 'border-slate-700 text-transparent'}`}><CheckCircle2 className="w-4 h-4" /></button>
                        </div>
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
