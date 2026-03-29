import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  Zap, 
  Shield, 
  Globe, 
  MessageSquare, 
  Code2, 
  Activity,
  ArrowRight,
  Trophy,
  Star
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const navigate = useNavigate();

  const handlePayment = async (plan: any) => {
    if (plan.price === '0') {
      navigate('/dashboard');
      return;
    }
    if (plan.price === 'Custom') {
      window.location.href = 'mailto:sales@prepai.com';
      return;
    }

    // Default bypass
    navigate('/dashboard');
  };

  const plans = [
    {
      name: 'Starter Protocol',
      price: '0',
      desc: 'Essential prep for early-career engineers.',
      features: [
        '5 AI Mock Interviews / mo',
        'Basic HR & Logic Rounds',
        'Standard Performance Report',
        'Community Support Access'
      ],
      cta: 'Begin Training',
      highlight: false
    },
    {
      name: 'Architect Mode',
      price: billingCycle === 'monthly' ? '199' : '149',
      desc: 'The gold standard for technical mastery.',
      features: [
        'Unlimited AI Mock Interviews',
        '24/7 Real-time AI Analyst',
        'Advanced System Design Rounds',
        'Full Analytics Dashboard',
        'Priority Technical Lab Access'
      ],
      cta: 'Activate Architect',
      highlight: true
    },
    {
      name: 'Elite / Team',
      price: 'Custom',
      desc: 'Enterprise-grade intelligence for groups.',
      features: [
        'Custom Interview Scripting',
        'Team Performance Heatmaps',
        'Bulk API Access for HR',
        'Dedicated Solutions Architect',
        'White-labeled Reporting'
      ],
      cta: 'Contact Sales',
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#08090b] text-white font-sans selection:bg-brand-cyan/30 overflow-x-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-cyan/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-brand-cyan/5 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/2" />

      {/* Nav Placeholder for Public View */}
      <header className="h-20 border-b border-white/[0.03] bg-black/20 backdrop-blur-md flex items-center justify-between px-10 sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-cyan rounded-lg flex items-center justify-center shadow-lg">
            <Star className="w-5 h-5 text-brand-dark" />
          </div>
          <span className="text-xl font-black tracking-tighter">PrepAI</span>
        </Link>
        <Link to="/dashboard" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">Return to System</Link>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-24 relative z-10 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20 space-y-6"
        >
          <span className="px-5 py-2 bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
            Scaling Strategy
          </span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-4">
             Unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-blue-400">Architect Mode.</span>
          </h1>
          <p className="text-lg text-white/40 max-w-xl mx-auto font-medium">
            Invest in your career intelligence. Choose the protocol that aligns with your engineering trajectory.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center gap-8 justify-center mt-12 bg-white/5 p-2 rounded-2xl border border-white/5 w-fit mx-auto">
             <button 
               onClick={() => setBillingCycle('monthly')}
               className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${billingCycle === 'monthly' ? 'bg-brand-cyan text-brand-dark shadow-xl' : 'text-white/20 hover:text-white'}`}
             >
               Monthly
             </button>
             <button 
               onClick={() => setBillingCycle('yearly')}
               className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${billingCycle === 'yearly' ? 'bg-brand-cyan text-brand-dark shadow-xl' : 'text-white/20 hover:text-white'}`}
             >
               Yearly <span className="ml-2 opacity-50 text-[8px] italic">-20%</span>
             </button>
          </div>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {plans.map((plan, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-[#0a0b0d] border rounded-[40px] p-10 flex flex-col shadow-2xl relative overflow-hidden group transition-all duration-500 hover:-translate-y-2 ${plan.highlight ? 'border-brand-cyan/40 shadow-[0_30px_60px_rgba(0,255,255,0.05)]' : 'border-white/5 hover:border-white/10'}`}
            >
              {plan.highlight && (
                 <div className="absolute top-0 right-0 px-8 py-2 bg-brand-cyan text-brand-dark text-[9px] font-black uppercase tracking-widest translate-x-4 translate-y-6 rotate-45 shadow-xl">
                   Recommended
                 </div>
              )}

              <div className="mb-10">
                 <h3 className={`text-sm font-black uppercase tracking-[0.3em] mb-4 ${plan.highlight ? 'text-brand-cyan' : 'text-white/40'}`}>{plan.name}</h3>
                 <div className="flex items-baseline gap-2 mb-4">
                   <span className="text-5xl font-black italic tracking-tighter">
                     {plan.price !== 'Custom' && '₹'}{plan.price}
                   </span>
                   {plan.price !== 'Custom' && plan.price !== '0' && <span className="text-white/20 font-bold uppercase text-[10px] tracking-widest">/ month</span>}
                 </div>
                 <p className="text-xs font-medium text-white/40 leading-relaxed">{plan.desc}</p>
              </div>

              <div className="flex-1 space-y-5 mb-12">
                 {plan.features.map((feature, j) => (
                   <div key={j} className="flex items-center gap-4 group/item">
                     <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${plan.highlight ? 'bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan' : 'bg-white/5 border-white/10 text-white/20'}`}>
                       <Check size={12} strokeWidth={4} />
                     </div>
                     <span className="text-xs font-bold text-white/60 group-hover/item:text-white transition-colors">{feature}</span>
                   </div>
                 ))}
              </div>

              <button 
                 onClick={() => handlePayment(plan)}
                 className={`w-full py-5 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all relative overflow-hidden group/btn flex items-center justify-center ${plan.highlight ? 'bg-brand-cyan text-brand-dark shadow-[0_10px_30px_rgba(0,255,255,0.2)]' : 'bg-white/5 text-white/50 border border-white/5 hover:bg-white/10 hover:text-white'}`}>
                 <span className="relative z-10 flex items-center justify-center gap-3">
                   {plan.cta}
                   <ArrowRight size={18} strokeWidth={3} className="transition-transform group-hover/btn:translate-x-1" />
                 </span>
              </button>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section Placeholder */}
        <section className="mt-40 grid lg:grid-cols-2 gap-20">
           <div className="space-y-8">
             <h2 className="text-4xl font-black tracking-tight leading-none uppercase">Trusted by <br /> <span className="text-brand-cyan italic">Architects.</span></h2>
             <p className="text-sm text-white/30 leading-relaxed max-w-sm">Join over 12k+ engineers already training in PrepAI sessions to land roles at Google, Stripe, and Vercel.</p>
           </div>
           <div className="space-y-8">
              {[
                { q: "Is 'Architect Mode' available for teams?", a: "Yes, our Elite plan includes team management and bulk session licenses." },
                { q: "Can I cancel anytime?", a: "Self-serve cancellation is available in your System Configuration dashboard at any time." }
              ].map((item, k) => (
                <div key={k} className="space-y-4 border-b border-white/5 pb-8">
                  <h4 className="text-sm font-black tracking-tight uppercase tracking-widest">{item.q}</h4>
                  <p className="text-xs font-medium text-white/20 leading-relaxed">{item.a}</p>
                </div>
              ))}
           </div>
        </section>

        <footer className="mt-32 pt-12 border-t border-white/5 w-full flex justify-between opacity-20">
           <div className="text-[10px] font-black uppercase tracking-[0.3em]">Authorized Protocol.</div>
           <div className="text-[10px] font-black tracking-[0.3em]">© 2026 PREPAI.</div>
        </footer>
      </main>
    </div>
  );
};

export default Pricing;
