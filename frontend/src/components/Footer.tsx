import { Layout } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="px-6 py-12 border-t border-white/5">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
      <div>
        <Link to="/" className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-brand-cyan rounded flex items-center justify-center">
            <Layout className="w-4 h-4 text-brand-dark" />
          </div>
          <span className="text-lg font-bold tracking-tight">PrepAI</span>
        </Link>
        <p className="text-[10px] uppercase tracking-widest font-black text-white/20">
          © 2026 PREPAI. | ARCHITECT: AYUSH KUMAR SAO
        </p>
      </div>
      
      <div className="flex items-center gap-8">
        {['Terms', 'Privacy', 'Twitter', 'GitHub'].map((link) => (
          <a key={link} href="#" className="text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-white transition-colors">
            {link}
          </a>
        ))}
      </div>
    </div>
  </footer>
);

export default Footer;
