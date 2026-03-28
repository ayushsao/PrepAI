import { 
  Play,
  MessageSquare,
  BarChart3,
  Code2,
  TrendingUp,
  CheckCircle2,
  User,
  Layout,
  Activity,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { BackgroundPaths } from '@/components/ui/background-paths';
import { RadarEffectDemo } from '@/components/RadarDemo';
import { Entropy } from '@/components/ui/entropy';
import { SpiralSection } from '@/components/SpiralSection';
import { ParticleSection } from '@/components/ParticleSection';
import OrbitingSkills from '@/components/ui/orbiting-skills';
import TextMarquee from '@/components/ui/text-marque';
import { ParallaxComponent } from '@/components/ui/parallax-scrolling';
import { Component as HorizonHero } from '@/components/ui/horizon-hero-section';


const Hero = () => (
  <section className="pt-20 pb-20 px-6 relative overflow-hidden min-h-[95vh] flex items-center bg-[#090a0c]">
    <Entropy />
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-brand-cyan/10 rounded-full blur-[150px]" />
    </div>
    
    <div className="max-w-7xl mx-auto w-full relative z-10 grid md:grid-cols-2 gap-16 items-center">
      {/* Left: Headlines + CTA */}
      <div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 border border-white/10 bg-white/5 mb-8"
        >
          <div className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest font-bold text-brand-cyan">Next-Gen Interview Intelligence</span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-2 mb-10"
        >
          <div className="flex flex-wrap gap-1 md:gap-2">
            {["MASTER", "EVERY", "INTERVIEW"].map((word, i) => (
               <motion.div 
                 key={word}
                 initial={{ x: -20, rotate: -2 }}
                 animate={{ x: 0, rotate: i % 2 === 0 ? 1 : -1 }}
                 className="bg-white text-black px-3 py-1 md:px-6 md:py-3 shadow-[4px_4px_0px_#22d3ee]"
               >
                  <h1 className="text-3xl md:text-6xl font-heading leading-none m-0">{word}</h1>
               </motion.div>
            ))}
          </div>
          <div className="bg-brand-cyan text-brand-dark px-3 py-1 md:px-6 md:py-3 -rotate-1 shadow-[4px_4px_0px_white] self-start">
             <h1 className="text-3xl md:text-6xl font-heading leading-none m-0">WITH AI.</h1>
          </div>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base md:text-lg text-white/50 mb-10 leading-relaxed max-w-lg"
        >
          The most advanced mock interview system for HR, Technical, and Behavioral rounds. 
          Record video, solve code, and get instant feedback.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-start gap-4"
        >
          <Link to="/dashboard" className="px-8 py-4 bg-brand-cyan text-brand-dark font-bold text-sm uppercase tracking-widest glow-button transition-all hover:scale-105 inline-block text-center">
            Start Practicing Free
          </Link>
          <a href="#features" className="px-8 py-4 border border-white/10 hover:bg-white/5 font-bold text-sm uppercase tracking-widest flex items-center gap-2 transition-all text-white/60 hover:text-white">
            <Play className="w-4 h-4 fill-current" />
            Watch Demo
          </a>
        </motion.div>
      </div>

      {/* Right: Tech Ecosystem orbital */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="hidden md:flex flex-col items-center justify-center"
      >
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-brand-cyan/5 blur-3xl scale-110" />
          <div className="border border-white/5 bg-black/30 p-8 relative">
            <OrbitingSkills size={340} />
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-6 h-px bg-brand-cyan" />
            <div className="absolute top-0 left-0 w-px h-6 bg-brand-cyan" />
            <div className="absolute bottom-0 right-0 w-6 h-px bg-brand-cyan" />
            <div className="absolute bottom-0 right-0 w-px h-6 bg-brand-cyan" />
          </div>
          <div className="mt-4 text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Tech Ecosystem</span>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);


const SessionPreview = () => (
  <section className="px-6 py-20">
    <div className="max-w-6xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="bg-brand-card rounded-3xl border border-white/5 overflow-hidden shadow-2xl"
      >
        <div className="h-12 bg-white/5 border-b border-white/5 flex items-center px-6 justify-between">
          <div className="flex items-center gap-2">
             <div className="w-4 h-4 bg-brand-cyan rounded flex items-center justify-center">
               <Layout className="w-2.5 h-2.5 text-brand-dark" />
             </div>
             <span className="text-xs font-bold tracking-tight">PrepAI</span>
          </div>
          <div className="text-[10px] uppercase tracking-widest font-bold text-white/40">
            Interview Session #4802 • Active
          </div>
          <div className="flex gap-1.5 grayscale opacity-50">
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <div className="w-2 h-2 rounded-full bg-white/20" />
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3">
          <div className="lg:col-span-2 p-1">
            <div className="aspect-video relative rounded-2xl overflow-hidden bg-[#0c0e12] flex items-center justify-center">
              {/* Abstract avatar replacement to prevent external CDN blocking on strict deploy environments */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/20 to-transparent mix-blend-overlay" />
              <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-[#1a2332] to-[#253248] border-4 border-white/5 flex items-center justify-center shadow-2xl">
                <User className="w-20 h-20 text-white/20" />
              </div>
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-bold tracking-widest uppercase">Recording</span>
              </div>
            </div>
          </div>
          
          <div className="p-8 border-l border-white/5 flex flex-col gap-8">
            <div>
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-cyan mb-3">Current Question</h4>
              <p className="text-lg font-medium leading-snug">
                "Tell me about a time you had to manage a conflict within a cross-functional team."
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-brand-cyan/5 border border-brand-cyan/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-brand-cyan rounded flex items-center justify-center">
                  <Play className="w-2 h-2 text-brand-dark fill-current" />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-brand-cyan">AI Live Suggestion</span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                Mention the specific resolution framework you used (e.g., STAR method) to improve your narrative clarity.
              </p>
            </div>
            
            <div className="space-y-4">
              {[
                { label: 'Eye Contact', value: 'Optimal', color: 'text-brand-cyan' },
                { label: 'Filler Words', value: 'Low (2.1%)', color: 'text-blue-400' },
                { label: 'Clarity', value: 'High', color: 'text-white' },
              ].map((metric) => (
                <div key={metric.label} className="flex items-center justify-between">
                  <span className="text-xs text-white/40 font-medium">{metric.label}</span>
                  <span className={`text-xs font-bold ${metric.color}`}>{metric.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

const TextMarqueeSection = () => (
  <section className="py-24 overflow-hidden bg-[#08090b] border-t border-b border-white/5 relative flex flex-col gap-6">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.05),transparent_50%)] pointer-events-none" />
    
    <div className="rotate-[-2deg] scale-110">
      <TextMarquee
        delay={0}
        baseVelocity={-2}
        className='text-5xl md:text-8xl font-black uppercase tracking-tight text-white/5 whitespace-nowrap'
      >
        MASTER EVERY INTERVIEW — CODE LIKE A PRO — ACE THE BEHAVIORAL ROUND — LAND YOUR DREAM JOB —
      </TextMarquee>
    </div>

    <div className="rotate-[-2deg] scale-110 -translate-x-12">
      <TextMarquee
        delay={200}
        baseVelocity={2}
        className='text-4xl md:text-7xl font-black uppercase tracking-tight text-brand-cyan/20 whitespace-nowrap'
      >
        NEXT-GEN AI COACH — LIVE FEEDBACK — SMART ANALYTICS — NO MORE REJECTIONS —
      </TextMarquee>
    </div>
  </section>
);

const Features = () => {
  const features = [
    {
      icon: <MessageSquare className="w-5 h-5 text-brand-cyan" />,
      title: "AI Mock Interviews",
      desc: "Engage in dynamic, context-aware conversations. Our AI adapts its questioning based on your previous answers.",
      viz: (
        <div className="flex items-end gap-1 h-12 mt-6">
          {[40, 70, 30, 90, 60].map((h, i) => (
            <div key={i} className="flex-1 bg-brand-cyan/20 rounded-t-sm" style={{ height: `${h}%` }}>
              {i === 3 && <div className="w-full h-full bg-brand-cyan rounded-t-sm" />}
            </div>
          ))}
        </div>
      )
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-brand-cyan" />,
      title: "Smart Analytics",
      desc: "Analyze filler words, speaking pace, and facial expressions to master your delivery.",
      viz: (
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
            <span>Confidence Score</span>
            <div className="flex items-center gap-1">
              <User className="w-2.5 h-2.5 text-brand-cyan" />
              <span className="text-white">8.5</span>
            </div>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative">
            <div className="h-full bg-brand-cyan w-[85%]" />
          </div>
        </div>
      )
    },
    {
      icon: <Code2 className="w-5 h-5 text-brand-cyan" />,
      title: "Coding Lab",
      desc: "Built-in IDE with real-time feedback on algorithmic complexity and edge cases.",
      viz: (
        <div className="mt-6 p-3 bg-black/40 rounded-lg border border-white/5 font-mono text-[10px] text-white/40">
          <div className="text-brand-cyan">function solve(arr) &#123;</div>
          <div className="pl-4">return arr.reduce((a, b) =&gt; a + b);</div>
          <div>&#125;</div>
          <div className="mt-2 flex items-center gap-2 text-green-500/60">
            <CheckCircle2 className="w-3 h-3" />
            <span>12/12 Tests Passed</span>
          </div>
        </div>
      )
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-brand-cyan" />,
      title: "Performance Analytics",
      desc: "Track your growth across multiple sessions. Visualize your progress with high-fidelity performance heatmaps.",
      viz: (
        <div className="flex items-end gap-1 h-12 mt-6">
          {[20, 40, 35, 60, 75, 55, 90].map((h, i) => (
            <div key={i} className="flex-1 bg-brand-cyan/20 rounded-t-sm" style={{ height: `${h}%` }}>
              {i === 6 && <div className="w-full h-full bg-brand-cyan rounded-t-sm" />}
            </div>
          ))}
        </div>
      )
    }
  ];

  return (
    <section id="features" className="px-6 py-20 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Engineered for Success</h2>
          <p className="text-white/40 max-w-xl mx-auto">Every tool you need to transition from candidate to employee.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 bg-brand-card rounded-2xl border border-white/5 hover:border-brand-cyan/20 transition-all group"
            >
              <div className="w-10 h-10 bg-brand-cyan/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed mb-4">{f.desc}</p>
              {f.viz}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AboutPrepAI = () => (
  <section id="about" className="px-6 py-24 bg-brand-card/50 border-t border-b border-white/5 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-cyan/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

    <div className="max-w-6xl mx-auto relative z-10">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div>
            <h4 className="text-brand-cyan font-bold tracking-widest text-xs uppercase mb-3">About The Project</h4>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Mastering the art of the interview, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-blue-400">powered by Intelligence.</span>
            </h2>
          </div>
          
          <p className="text-lg text-white/60 leading-relaxed font-medium">
            PrepAI was built with a singular vision: to democratize interview preparation. 
            We noticed that the barrier between a great candidate and a great job wasn't always skill—it was simply the lack of realistic, high-pressure practice.
          </p>

          <div className="space-y-6 pt-4 border-t border-white/10">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-cyan/10 flex items-center justify-center flex-shrink-0">
                <Code2 className="w-5 h-5 text-brand-cyan" />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">Architected by Ayush</h4>
                <p className="text-sm text-white/50 leading-relaxed">Built from the ground up by Ayush Kumar Sao as a passion project to bridge the gap between technical brilliance and behavioral communication.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-cyan/10 flex items-center justify-center flex-shrink-0">
                <Activity className="w-5 h-5 text-brand-cyan" />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">Real-Time Processing</h4>
                <p className="text-sm text-white/50 leading-relaxed">Leveraging the latest in Gemini 2.0 processing to simulate human interview behavior without lag, evaluating everything from logic to syntax to tone.</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="aspect-square max-w-[500px] mx-auto bg-gradient-to-tr from-brand-cyan/20 to-transparent rounded-[3rem] p-1 border border-white/10 shadow-2xl relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.1),transparent_70%)] pointer-events-none" />
            <div className="w-full h-full bg-[#0a0b0d] rounded-[2.8rem] overflow-hidden relative">
               <img
                 src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1200&auto=format&fit=crop"
                 alt="Coding and Interviews"
                 className="w-full h-full object-cover opacity-50 contrast-125 mix-blend-luminosity hover:scale-105 transition-transform duration-700"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b0d] via-transparent to-transparent" />
               <div className="absolute bottom-8 left-8 right-8">
                 <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl">
                    <p className="text-brand-cyan font-mono text-sm mb-2">// Mission Objective</p>
                    <p className="text-white/90 text-lg font-medium leading-snug">"Empowering engineers to walk into any room and own the technical conversation, every time."</p>
                 </div>
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

const PathToHiring = () => (
  <section id="path" className="px-6 py-32">
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-20">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Your Path to Hiring</h2>
      </div>
      
      <div className="space-y-12 relative">
        <div className="absolute left-6 top-8 bottom-8 w-px bg-white/10" />
        
        {[
          {
            step: 1,
            title: "Setup Your Profile",
            desc: "Upload your resume and select the target role. Our AI tailors questions specifically to the industry, seniority level, and company culture."
          },
          {
            step: 2,
            title: "Live AI Mock Interview",
            desc: "Practice in a realistic environment. Face follow-up questions, technical challenges, and pressure tests designed to sharpen your thinking."
          },
          {
            step: 3,
            title: "Detailed Feedback Scorecard",
            desc: "Receive a granular report within seconds. We analyze your body language, content quality, and key improvement areas for every single response."
          }
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex gap-12 relative z-10"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-white/60 font-bold text-lg shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-brand-cyan/5 group-hover:bg-brand-cyan/10 transition-colors" />
              <span className="relative z-10 tracking-widest">{item.step}</span>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-white/50 leading-relaxed max-w-2xl">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const CTA = () => (
  <section id="pricing" className="px-6 py-20">
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="max-w-5xl mx-auto bg-brand-card rounded-[40px] p-12 md:p-24 text-center border border-white/5 relative overflow-hidden"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-cyan/5 rounded-full blur-[100px]" />
      </div>
      
      <h2 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-[0.85]">
        Ready to Land Your <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-blue-400">Dream Job?</span>
      </h2>
      <p className="text-lg text-white/40 max-w-lg mx-auto mb-12">
        Start your first mock interview today and get the edge you need to succeed.
      </p>
      <Link to="/dashboard" className="px-10 py-5 bg-brand-cyan text-brand-dark font-bold rounded-2xl glow-button transition-all hover:scale-105 inline-block">
        Get Started Now
      </Link>
    </motion.div>
  </section>
);

const LandingPage = () => {
  return (
    <>
      <HorizonHero />
      <TextMarqueeSection />
      <ParallaxComponent />
      <SessionPreview />
      <AboutPrepAI />
      <Features />
      <RadarEffectDemo />
      <SpiralSection />
      <PathToHiring />
      <ParticleSection />
      <CTA />
    </>
  );
};

export default LandingPage;
