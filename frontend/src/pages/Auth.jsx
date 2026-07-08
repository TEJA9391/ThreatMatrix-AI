import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Shield, Lock, Mail, User, Cpu, Zap, 
  AlertTriangle, CheckCircle2, Eye, EyeOff, 
  ChevronRight, ArrowRight, Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated } = useUser();
  
  const isRegisterPage = location.pathname === '/register';
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Security Analyst',
    level: '3',
    bio: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  
  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const runSimulationLogs = (onComplete) => {
    setLogs([]);
    const simulatedSteps = isRegisterPage ? [
      "[SYS] Initiating decentralized registration handshake...",
      "[SEC] Resolving Zero-Knowledge mainnet endpoint...",
      "[AUTH] Generating unique cryptographic keypair...",
      "[DB] Syncing profile database index...",
      "[SYS] Storing level authority attributes...",
      "[SYS] Registration verified. Establishing mainnet session."
    ] : [
      "[SYS] Establishing end-to-end encrypted tunnels...",
      "[AUTH] Sending credentials digest...",
      "[SEC] Authenticating through Level-7 firewall...",
      "[SYS] Decrypting signature authority keys...",
      "[SYS] Privileges confirmed. Mounting neural interface."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < simulatedSteps.length) {
        setLogs(prev => [...prev, simulatedSteps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setLoading(false);
          onComplete();
        }, 800);
      }
    }, 400);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username) {
      setError('System identity key (Username) required.');
      return;
    }
    if (formData.password.length < 4) {
      setError('Cryptographic password must be at least 4 digits.');
      return;
    }
    if (isRegisterPage && !formData.email) {
      setError('Communications relay address (Email) required.');
      return;
    }

    setLoading(true);
    setError('');

    let result;
    if (isRegisterPage) {
      result = await register(
        formData.username, 
        formData.email, 
        formData.role, 
        formData.level, 
        formData.bio,
        formData.password
      );
    } else {
      result = await login(formData.username, formData.password);
    }

    if (result && !result.success) {
      setLoading(false);
      setError(result.error);
    } else {
      runSimulationLogs(() => {
        navigate('/');
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 relative">
      {/* Background glow matrix */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,243,255,0.04)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="w-full max-w-lg relative">
        {/* Decorative corner brackets for futuristic HUD aesthetic */}
        <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-cyber-neon" />
        <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-cyber-neon" />
        <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-cyber-neon" />
        <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-cyber-neon" />

        <div className="glass-card bg-black/80 border border-white/10 rounded-2xl p-10 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
          {/* Logo / Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-cyber-neon/10 border border-cyber-neon/30 flex items-center justify-center mb-4 relative group shadow-[0_0_15px_rgba(0,243,255,0.1)]">
              <Shield className="w-8 h-8 text-cyber-neon animate-pulse" />
              <div className="absolute inset-0 border border-cyber-neon rounded-2xl scale-110 opacity-30 animate-ping duration-1000" />
            </div>
            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
              THREAT<span className="text-cyber-neon">MATRIX</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1.5">
              {isRegisterPage ? "SECURE MAINNET REGISTRATION" : "SECURE NODE AUTHENTICATION"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!loading ? (
              <motion.form 
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSubmit} 
                className="space-y-6"
              >
                {error && (
                  <div className="p-4 bg-cyber-neon-red/5 border border-cyber-neon-red/20 rounded-xl flex items-center gap-3 text-cyber-neon-red text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Username */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">System Identity (Username)</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input 
                      type="text" 
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="e.g. SECURE_ADMIN"
                      className="w-full pl-11 pr-4 py-3 bg-white/[0.02] border border-white/10 focus:border-cyber-neon/40 hover:border-white/20 rounded-xl text-sm font-bold text-white placeholder-slate-600 transition-all duration-300 outline-none"
                    />
                  </div>
                </div>

                {/* Email (only on register) */}
                {isRegisterPage && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Comms Relay (Email)</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e.g. agent@threatmatrix.ai"
                        className="w-full pl-11 pr-4 py-3 bg-white/[0.02] border border-white/10 focus:border-cyber-neon/40 hover:border-white/20 rounded-xl text-sm font-bold text-white placeholder-slate-600 transition-all duration-300 outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Access Level & Role (only on register) */}
                {isRegisterPage && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">System Role</label>
                        <select 
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-black border border-white/10 focus:border-cyber-neon/40 hover:border-white/20 rounded-xl text-xs font-bold text-white transition-all duration-300 outline-none"
                        >
                          <option value="Security Analyst">Security Analyst</option>
                          <option value="Threat Researcher">Threat Researcher</option>
                          <option value="SOC Lead">SOC Lead</option>
                          <option value="Super Admin">Super Admin</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Clearance Level</label>
                        <select 
                          name="level"
                          value={formData.level}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-black border border-white/10 focus:border-cyber-neon/40 hover:border-white/20 rounded-xl text-xs font-bold text-white transition-all duration-300 outline-none"
                        >
                          <option value="1">Level 1 (Access)</option>
                          <option value="3">Level 3 (Operator)</option>
                          <option value="5">Level 5 (Lead)</option>
                          <option value="7">Level 7 (Master)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Operational Bio (Optional)</label>
                      <textarea 
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="e.g. Threat response operator specializing in zero-day network forensics."
                        rows="3"
                        className="w-full px-4 py-3 bg-white/[0.02] border border-white/10 focus:border-cyber-neon/40 hover:border-white/20 rounded-xl text-sm font-bold text-white placeholder-slate-600 transition-all duration-300 outline-none resize-none"
                      />
                    </div>
                  </>
                )}

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Cryptographic Key (Password)</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-3 bg-white/[0.02] border border-white/10 focus:border-cyber-neon/40 hover:border-white/20 rounded-xl text-sm font-bold text-white placeholder-slate-600 transition-all duration-300 outline-none"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <button 
                  type="submit"
                  className="w-full py-3.5 bg-cyber-neon hover:bg-cyber-neon/90 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(0,243,255,0.2)] flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>{isRegisterPage ? "Register Node Credentials" : "Authorize Session"}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Toggle Register/Login Link */}
                <div className="text-center pt-4 border-t border-white/5">
                  <p className="text-xs text-slate-500 font-bold">
                    {isRegisterPage ? (
                      <>
                        Already authorized?{" "}
                        <Link to="/login" className="text-cyber-neon hover:underline font-black uppercase tracking-wider ml-1">
                          Secure Login
                        </Link>
                      </>
                    ) : (
                      <>
                        First time on the mainnet?{" "}
                        <Link to="/register" className="text-cyber-purple hover:underline font-black uppercase tracking-wider ml-1">
                          Register credentials
                        </Link>
                      </>
                    )}
                  </p>
                </div>
              </motion.form>
            ) : (
              /* Decryption & Handshake Loader console */
              <motion.div 
                key="loader"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div className="p-6 bg-black border border-white/10 rounded-2xl font-mono text-[11px] text-cyber-neon space-y-2 relative overflow-hidden min-h-[180px] shadow-[inset_0_0_20px_rgba(0,243,255,0.05)]">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Terminal className="w-16 h-16 text-cyber-neon" />
                  </div>
                  <div className="flex items-center gap-2 mb-4 text-white font-bold pb-2 border-b border-white/10">
                    <Cpu className="w-4 h-4 text-cyber-neon animate-spin" />
                    <span>THREATMATRIX AUTH TERMINAL</span>
                  </div>
                  {logs.map((log, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="leading-relaxed"
                    >
                      {log}
                    </motion.div>
                  ))}
                  <div className="w-1.5 h-4 bg-cyber-neon animate-pulse inline-block mt-1" />
                </div>
                <div className="text-center text-xs font-bold text-slate-500 animate-pulse">
                  DECRYPTING DATA HANDSHAKE...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
