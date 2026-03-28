import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  User,
  Lock,
  Bell,
  Shield,
  Database,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  Globe,
  Monitor
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateUser({ avatar: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const currentAvatar = user?.avatar || (user?.role === 'architect' 
    ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80" 
    : "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80");

  const tabs = [
    { id: 'profile', label: 'Profile Management', icon: User },
    { id: 'security', label: 'System Security', icon: Shield },
    { id: 'preferences', label: 'Interview Config', icon: SettingsIcon },
    { id: 'billing', label: 'Subscription Info', icon: CreditCard }
  ];

  return (
    <div className="h-screen w-full flex bg-[#08090b] text-white overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-[#08090b]">
        <header className="mb-12">
           <h1 className="text-4xl font-black tracking-tight leading-none uppercase tracking-widest text-white/90">System Configuration</h1>
           <p className="text-lg text-white/40 max-w-xl font-medium mt-2">
             Tune your PrepAI experience for maximum architectural performance.
           </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Settings Tabs Sidebar */}
          <aside className="w-full lg:w-72 flex flex-col gap-3 shrink-0">
             {tabs.map(tab => (
               <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-4 px-6 py-4 rounded-3xl transition-all duration-300 group ${activeTab === tab.id ? 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20 shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
               >
                 <tab.icon size={18} className={activeTab === tab.id ? 'text-brand-cyan' : 'group-hover:text-brand-cyan'} />
                 <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
                 {activeTab === tab.id && <div className="ml-auto w-1 h-4 bg-brand-cyan rounded-full" />}
               </button>
             ))}
          </aside>

          {/* Settings Content Area */}
          <div className="flex-1 max-w-4xl">
            {activeTab === 'profile' && (
              <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="space-y-12"
              >
                {/* Profile Settings Block */}
                <div className="bg-[#0a0b0d] border border-white/5 rounded-[40px] p-10 shadow-2xl relative overflow-hidden group hover:border-brand-cyan/10 transition-all">
                   <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-cyan/5 rounded-full blur-[100px]" />
                   
                   <div className="relative z-10">
                     <div className="flex items-center gap-8 mb-12">
                       <div className="w-24 h-24 rounded-[32px] overflow-hidden border-2 border-brand-cyan/30 shadow-[0_0_30px_rgba(0,255,255,0.1)]">
                         <img 
                           src={currentAvatar}
                           alt={user?.name}
                           className="w-full h-full object-cover"
                         />
                       </div>
                       <div>
                         <h3 className="text-xl font-black text-white">{user?.name}</h3>
                         <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">{user?.role || 'Architect'} Protocol</p>
                         <input 
                           type="file" 
                           ref={fileInputRef} 
                           onChange={handleAvatarChange} 
                           accept="image/*" 
                           className="hidden" 
                         />
                         <button 
                           onClick={() => fileInputRef.current?.click()}
                           className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                         >
                           Update Avatar
                         </button>
                       </div>
                     </div>

                     <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Public Name</label>
                         <input type="text" value={user?.name} className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-brand-cyan/50 transition-all" />
                       </div>
                       <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Authorized Email</label>
                         <input type="email" value={user?.email} className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-brand-cyan/50 transition-all" />
                       </div>
                     </div>
                   </div>
                </div>

                {/* Preference Block */}
                <div className="bg-[#0a0b0d] border border-white/5 rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
                   <h3 className="text-sm font-black uppercase tracking-widest text-white/60 mb-8 border-l-4 border-brand-cyan pl-4">System Identity</h3>
                   <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Primary Role</label>
                         <select className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-brand-cyan/50 transition-all appearance-none cursor-pointer">
                           <option>Software Architect</option>
                           <option>Staff React Engineer</option>
                           <option>Engineering Manager</option>
                         </select>
                       </div>
                       <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Target Industry</label>
                         <select className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-brand-cyan/50 transition-all appearance-none cursor-pointer">
                           <option>SaaS & Cloud</option>
                           <option>Fintech/E-commerce</option>
                           <option>Defense/Aerospace</option>
                         </select>
                       </div>
                   </div>
                </div>

                <div className="flex justify-end gap-6 pt-8">
                   <button className="px-8 py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Discard Changes</button>
                   <button className="px-10 py-4 bg-brand-cyan text-brand-dark rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 shadow-[0_10px_30px_rgba(0,255,255,0.2)]">Synchronize Profile</button>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="space-y-8"
              >
                 <div className="bg-[#0a0b0d] border border-white/5 rounded-[40px] p-10 flex flex-col md:flex-row items-center justify-between gap-12 group">
                   <div className="space-y-4">
                     <h3 className="text-xl font-black">Multi-Factor Authentication</h3>
                     <p className="text-sm text-white/30 leading-relaxed max-w-sm">Secure your PrepAI environment with an additional verification layer for all interview logic updates.</p>
                   </div>
                   <button className="px-8 py-4 bg-[#1b232e] text-blue-400 border border-blue-400/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-400 hover:text-white transition-all">Enable MFA Now</button>
                 </div>

                 <div className="bg-[#0a0b0d] border border-white/5 rounded-[40px] p-10 space-y-8">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white/60 pl-4 border-l-4 border-red-500">Security Actions</h3>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="flex justify-between items-center p-6 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-red-500/20 transition-all">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Data Access</span>
                          <span className="text-sm font-bold block">Reset History</span>
                        </div>
                        <button className="p-3 text-white/20 hover:text-red-500 transition-colors"><ChevronRight /></button>
                      </div>
                      <div className="flex justify-between items-center p-6 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-red-500/20 transition-all text-red-400/80">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-red-500/20">Danger Zone</span>
                          <span className="text-sm font-bold block">Terminate System</span>
                        </div>
                        <button className="p-3 text-red-500/30 hover:text-red-500 transition-colors"><Shield size={20} /></button>
                      </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="space-y-8"
              >
                 <div className="bg-[#0a0b0d] border border-white/5 rounded-[40px] p-10 space-y-8">
                   <h3 className="text-xl font-black mb-2">Interview Configuration</h3>
                   <p className="text-sm text-white/30 leading-relaxed max-w-xl mb-8">Customize the AI interviewer behavior, interview parameters, and session tracking settings.</p>
                   
                   <div className="space-y-6">
                     <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                       <div className="space-y-1">
                         <span className="text-sm font-bold block">Hard Mode (Stress Testing)</span>
                         <span className="text-[10px] font-black uppercase tracking-widest text-white/20">AI will ask counter-questions faster</span>
                       </div>
                       <div className="w-12 h-6 bg-brand-cyan/20 rounded-full relative cursor-pointer">
                         <div className="w-6 h-6 bg-brand-cyan rounded-full shadow-[0_0_10px_rgba(0,255,255,0.4)] absolute right-0 scale-110" />
                       </div>
                     </div>

                     <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                       <div className="space-y-1">
                         <span className="text-sm font-bold block">Transcription Logging</span>
                         <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Save all session transcripts</span>
                       </div>
                       <div className="w-12 h-6 bg-brand-cyan/20 rounded-full relative cursor-pointer">
                         <div className="w-6 h-6 bg-brand-cyan rounded-full shadow-[0_0_10px_rgba(0,255,255,0.4)] absolute right-0 scale-110" />
                       </div>
                     </div>

                     <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl opacity-50 grayscale">
                       <div className="space-y-1">
                         <span className="text-sm font-bold block flex items-center gap-2">Video Analysis <span className="bg-brand-cyan/10 text-brand-cyan text-[8px] px-2 py-0.5 rounded-full uppercase tracking-widest">Pro</span></span>
                         <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Track micro-expressions & eye contact</span>
                       </div>
                       <div className="w-12 h-6 bg-white/5 rounded-full relative cursor-pointer">
                         <div className="w-4 h-4 bg-white/20 rounded-full absolute left-1 top-1" />
                       </div>
                     </div>
                   </div>
                 </div>
              </motion.div>
            )}

            {activeTab === 'billing' && (
              <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="space-y-8"
              >
                 <div className="bg-[#0a0b0d] border border-white/5 rounded-[40px] p-10 relative overflow-hidden group">
                   <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-cyan/5 rounded-full blur-[80px]" />
                   
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 relative z-10">
                     <div>
                       <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-cyan mb-2">Current Plan</h3>
                       <div className="flex items-baseline gap-2">
                         <span className="text-4xl font-black">Free Tier</span>
                       </div>
                       <p className="text-sm text-white/40 mt-2">Basic mock interviews and limited feedback.</p>
                     </div>
                     <button className="px-8 py-4 bg-brand-cyan text-brand-dark rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_10px_30px_rgba(0,255,255,0.2)]">Upgrade to Pro</button>
                   </div>

                   <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center gap-6">
                     <div className="w-16 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                       <CreditCard className="text-white/40" />
                     </div>
                     <div>
                       <h4 className="text-sm font-bold">No Payment Method</h4>
                       <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-1">Upgrade to unlock advanced features</p>
                     </div>
                   </div>
                 </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
