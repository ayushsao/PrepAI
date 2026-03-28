import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Layout, 
  User, 
  Code2, 
  Activity, 
  History, 
  Plus, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', icon: Layout, path: '/dashboard' },
    { label: 'AI Mock Interviews', icon: User, path: '/interview' },
    { label: 'Coding Lab', icon: Code2, path: '/coding-lab' },
    { label: 'Performance Analytics', icon: Activity, path: '/analytics' },
    { label: 'Feedback', icon: History, path: '/feedback' }
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="lg:hidden absolute top-6 right-6 z-50 p-2 bg-[#0a0b0d] border border-white/10 rounded-xl text-white hover:bg-white/5 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`w-72 border-r border-white/[0.03] bg-[#0a0b0d] flex-col shrink-0 p-8 shadow-2xl z-50 fixed inset-y-0 left-0 lg:relative lg:flex transition-transform duration-300 ${isOpen ? 'translate-x-0 flex' : '-translate-x-full lg:translate-x-0'}`}>
      <div className="flex items-center gap-3 mb-10 px-2 transition-transform hover:scale-[1.02]">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-brand-cyan rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,255,255,0.2)]">
            <Layout className="w-6 h-6 text-brand-dark" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white">PrepAI</span>
        </Link>
      </div>

      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 mb-10 flex items-center gap-4 group transition-all hover:bg-white/[0.05]">
        <div className="w-12 h-12 rounded-xl overflow-hidden border border-brand-cyan/30 shadow-lg bg-gray-800 flex-shrink-0">
          <img
            src={user?.avatar || (user?.role === 'architect' ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80" : "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80")}
            alt={user?.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-black tracking-tight text-white truncate">{user?.name || 'Candidate'}</h3>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest truncate">System Active</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
        {navItems.map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={i} 
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${isActive ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 shadow-[0_0_20px_rgba(0,255,255,0.05)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              <item.icon size={20} className={isActive ? 'text-brand-cyan' : 'group-hover:text-brand-cyan transition-colors'} />
              <span className="text-sm font-bold tracking-tight">{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-cyan shadow-[0_0_8px_rgba(0,255,255,0.8)]" />}
            </Link>
          );
        })}
      </nav>

      <div className="pt-8 border-t border-white/5 space-y-4">
        <Link to="/interview" onClick={() => setIsOpen(false)} className="w-full py-4 bg-brand-cyan text-brand-dark rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_10px_30px_rgba(34,211,238,0.2)]">
          <Plus size={18} strokeWidth={3} />
          New Interview
        </Link>
        
        <div className="space-y-4 px-1.5">
          <Link to="/settings" onClick={() => setIsOpen(false)} className={`flex items-center gap-4 transition-colors ${location.pathname === '/settings' ? 'text-brand-cyan' : 'text-white/30 hover:text-white'}`}>
            <Settings size={18} />
            <span className="text-xs font-bold tracking-tight">Settings</span>
          </Link>
          <button onClick={logout} className="flex items-center gap-4 text-white/30 hover:text-red-400 transition-colors w-full text-left">
            <LogOut size={18} />
            <span className="text-xs font-bold tracking-tight">Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
