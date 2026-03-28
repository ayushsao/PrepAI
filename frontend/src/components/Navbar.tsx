import { Layout, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#090a0c]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-cyan rounded-lg flex items-center justify-center">
            <Layout className="w-5 h-5 text-brand-dark" />
          </div>
          <span className="text-xl font-bold tracking-tight">PrepAI</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link to="/dashboard" className="text-sm font-medium text-brand-cyan">Dashboard</Link>
          <a href="/#features" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Features</a>
          <Link to="/pricing" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Pricing</Link>
          <a href="/#about" className="text-sm font-medium text-white/60 hover:text-white transition-colors">About</a>
        </div>

        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <button 
              onClick={logout}
              className="flex items-center gap-2 text-sm font-medium text-white/60 hover:text-red-400 transition-colors"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          ) : (
            <>
              <Link to="/auth" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Log In</Link>
              <Link to="/auth" className="px-5 py-2.5 bg-brand-cyan text-brand-dark text-sm font-bold rounded-lg glow-button transition-all hover:scale-105">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
