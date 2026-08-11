import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Activity,
  Flame,
  Video,
  BarChart3,
  BookOpen,
  TrendingUp,
  Target,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';
import { apiUrl } from '../lib/api';

interface Analytics {
  readiness: number;
  breakdown: {
    technical: number;
    communication: number;
    behavioral: number;
  };
  streak: number;
  metrics?: {
    confidence?: { value: string; change: string };
    technical?: { value: string; change: string };
    content?: { value: string; change: string };
    filler?: { value: string; change: string };
  };
  skillProficiency?: { skill: string; score: number }[];
  progressionData?: {
    targetPoints: number[];
    baselinePoints: number[];
    labels: string[];
  };
  recentSessions?: { role: string; date?: string; score?: number }[];
}

const StatCard = ({
  label,
  value,
  sub,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accent?: boolean;
}) => (
  <div className={`bg-[#0d0e11] border ${accent ? 'border-brand-cyan/20' : 'border-white/[0.06]'} rounded-2xl p-6 flex items-start gap-4`}>
    <div className={`p-3 rounded-xl ${accent ? 'bg-brand-cyan/10 text-brand-cyan' : 'bg-white/[0.04] text-white/50'}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-bold text-white tracking-tight leading-none">{value}</p>
      {sub && <p className="text-[11px] text-white/30 mt-1 font-medium">{sub}</p>}
    </div>
  </div>
);

const ProgressBar = ({
  label,
  value,
  delay = 0,
}: {
  label: string;
  value: number;
  delay?: number;
}) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <span className="text-[12px] font-semibold text-white/50">{label}</span>
      <span className="text-[12px] font-bold text-white/80">{value}%</span>
    </div>
    <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.9, delay, ease: 'easeOut' }}
        className="h-full bg-brand-cyan rounded-full"
      />
    </div>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center h-full gap-3 py-8 text-center">
    <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center">
      <Activity size={18} className="text-white/20" />
    </div>
    <p className="text-[12px] text-white/25 font-medium max-w-[160px] leading-relaxed">{message}</p>
  </div>
);

const Dashboard = () => {
  const { user, token } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(apiUrl('/analytics'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data);
        }
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchAnalytics();
  }, [token]);

  const readiness = analytics?.readiness ?? 0;
  const breakdown = analytics?.breakdown ?? { technical: 0, communication: 0, behavioral: 0 };
  const streak = analytics?.streak ?? 0;
  const recentSessions = analytics?.recentSessions ?? [];
  const skillProficiency = analytics?.skillProficiency ?? [];
  const progressionData = analytics?.progressionData;

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  // Derive hourly greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Real weekly chart data from progressionData or empty
  const chartPoints = progressionData?.baselinePoints ?? [];
  const chartLabels = progressionData?.labels ?? [];
  const chartMax = Math.max(...chartPoints, 1); // avoid div by zero

  return (
    <div className="h-screen w-full flex bg-[#08090b] text-white overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-[#08090b] relative pt-20 lg:pt-0 custom-scrollbar">
        <div className="max-w-7xl mx-auto p-6 lg:p-10">

          {/* ── Header ── */}
          <header className="flex flex-col xl:flex-row justify-between items-start mb-10 gap-6">
            <div className="space-y-1.5">
              <p className="text-[12px] font-semibold text-white/30 uppercase tracking-widest">{greeting}</p>
              <h1 className="text-3xl lg:text-[2.4rem] font-bold tracking-tight leading-none text-white">
                {firstName}
              </h1>
              <p className="text-[14px] text-white/35 font-medium mt-2">
                {recentSessions.length > 0
                  ? `${recentSessions.length} interview session${recentSessions.length !== 1 ? 's' : ''} completed — keep the momentum going.`
                  : 'Start your first mock interview to begin tracking your progress.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 w-full xl:w-auto">
              <Link
                to="/interview"
                className="flex-1 xl:flex-none px-6 py-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl text-[12px] font-semibold tracking-wide transition-all flex items-center justify-center gap-2 text-white/70 hover:text-white"
              >
                <Video size={14} />
                Resume Last Session
              </Link>
              <Link
                to="/interview"
                className="flex-1 xl:flex-none px-6 py-3 bg-brand-cyan text-[#08090b] rounded-xl text-[12px] font-bold tracking-wide transition-all hover:brightness-110 shadow-[0_8px_24px_rgba(34,211,238,0.2)] flex items-center justify-center gap-2"
              >
                <Plus size={14} strokeWidth={3} />
                New Interview
              </Link>
            </div>
          </header>

          {/* ── Stat Row ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Readiness"
              value={`${readiness}%`}
              sub={readiness > 50 ? 'On track' : 'Building baseline'}
              icon={Target}
              accent={readiness > 50}
            />
            <StatCard
              label="Sessions"
              value={recentSessions.length}
              sub={recentSessions.length > 0 ? `Last: ${recentSessions[0]?.role ?? 'General'}` : 'None yet'}
              icon={Video}
            />
            <StatCard
              label="Streak"
              value={`${streak} ${streak === 1 ? 'day' : 'days'}`}
              sub={streak > 0 ? 'Keep it going' : 'Start today'}
              icon={Flame}
              accent={streak > 0}
            />
            <StatCard
              label="Technical"
              value={`${breakdown.technical}%`}
              sub="Proficiency score"
              icon={BarChart3}
            />
          </div>

          {/* ── Main Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">

            {/* Readiness Breakdown */}
            <div className="col-span-1 lg:col-span-5 bg-[#0d0e11] border border-white/[0.06] rounded-2xl p-8 flex flex-col gap-8">
              <div>
                <h2 className="text-[13px] font-semibold text-white/50 uppercase tracking-widest mb-1">Overall Readiness</h2>
                <p className="text-[11px] text-white/25 font-medium">Based on your completed sessions</p>
              </div>

              {/* Circular gauge */}
              <div className="flex items-center gap-8">
                <div className="relative w-32 h-32 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      className="text-white/[0.04]"
                      strokeWidth="7"
                      stroke="currentColor"
                      fill="transparent"
                      r="42"
                      cx="50"
                      cy="50"
                    />
                    <motion.circle
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: readiness / 100 }}
                      transition={{ duration: 1.4, ease: 'easeOut' }}
                      className="text-brand-cyan"
                      strokeWidth="7"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="42"
                      cx="50"
                      cy="50"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold tracking-tight">{readiness}%</span>
                  </div>
                </div>

                <div className="flex-1 space-y-1 text-[12px] text-white/35 font-medium">
                  <p>Technical: <span className="text-white/70 font-semibold">{breakdown.technical}%</span></p>
                  <p>Communication: <span className="text-white/70 font-semibold">{breakdown.communication}%</span></p>
                  <p>Behavioral: <span className="text-white/70 font-semibold">{breakdown.behavioral}%</span></p>
                </div>
              </div>

              {/* Progress bars */}
              <div className="space-y-4 pt-2 border-t border-white/[0.05]">
                <ProgressBar label="Technical Proficiency" value={breakdown.technical} delay={0} />
                <ProgressBar label="Communication" value={breakdown.communication} delay={0.1} />
                <ProgressBar label="Behavioral Confidence" value={breakdown.behavioral} delay={0.2} />
              </div>
            </div>

            {/* Skills & Weekly Chart */}
            <div className="col-span-1 lg:col-span-7 flex flex-col gap-6">

              {/* Weekly Performance Chart */}
              <div className="bg-[#0d0e11] border border-white/[0.06] rounded-2xl p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-[13px] font-semibold text-white/50 uppercase tracking-widest">Performance Trend</h2>
                    <p className="text-[11px] text-white/25 font-medium mt-0.5">Score progression across sessions</p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-brand-cyan">
                    <TrendingUp size={14} />
                    <span>{chartPoints.length > 1 && chartPoints[chartPoints.length - 1] > chartPoints[0] ? 'Improving' : chartPoints.length > 0 ? 'Tracking' : 'No data yet'}</span>
                  </div>
                </div>

                {chartPoints.length > 0 ? (
                  <div className="flex-1 flex flex-col justify-end">
                    <div className="flex items-end gap-3 h-28 px-2">
                      {chartPoints.map((val, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#1a1b1f] border border-white/10 text-white text-[10px] font-semibold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {val}%
                          </div>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(val / chartMax) * 100}%` }}
                            transition={{ duration: 0.7, delay: i * 0.06, ease: 'easeOut' }}
                            className="w-full bg-brand-cyan/20 hover:bg-brand-cyan/35 rounded-md transition-colors cursor-default"
                            style={{ minHeight: '4px' }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 px-2 mt-2">
                      {chartLabels.map((label, i) => (
                        <p key={i} className="flex-1 text-center text-[9px] font-semibold text-white/20 uppercase tracking-wider truncate">
                          {label}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : (
                  <EmptyState message="Complete a session to see your performance trend here." />
                )}
              </div>

              {/* Skill Proficiency */}
              <div className="bg-[#0d0e11] border border-white/[0.06] rounded-2xl p-8">
                <h2 className="text-[13px] font-semibold text-white/50 uppercase tracking-widest mb-5">Skill Proficiency</h2>
                {skillProficiency.length > 0 ? (
                  <div className="space-y-3.5">
                    {skillProficiency.slice(0, 4).map((item, i) => (
                      <ProgressBar key={i} label={item.skill} value={item.score} delay={i * 0.08} />
                    ))}
                  </div>
                ) : (
                  <EmptyState message="Skill data will appear after your first session." />
                )}
              </div>
            </div>
          </div>

          {/* ── Bottom Grid: Sessions + Quick Actions ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Recent Sessions */}
            <div className="col-span-1 lg:col-span-8 bg-[#0d0e11] border border-white/[0.06] rounded-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[13px] font-semibold text-white/50 uppercase tracking-widest">Recent Sessions</h2>
                <Link to="/feedback" className="text-[11px] font-semibold text-brand-cyan hover:text-white transition-colors flex items-center gap-1">
                  View all <ArrowUpRight size={12} />
                </Link>
              </div>

              {recentSessions.length > 0 ? (
                <div className="divide-y divide-white/[0.04]">
                  {recentSessions.slice(0, 5).map((session, i) => (
                    <div key={i} className="flex items-center gap-4 py-3.5 group">
                      <div className="w-8 h-8 rounded-lg bg-brand-cyan/10 flex items-center justify-center text-brand-cyan shrink-0">
                        <CheckCircle2 size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-white/80 truncate">{session.role || 'General Interview'}</p>
                        {session.date && (
                          <p className="text-[11px] text-white/30 font-medium mt-0.5">
                            {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                      {session.score !== undefined && (
                        <span className={`text-[12px] font-bold px-3 py-1 rounded-lg ${session.score >= 70 ? 'bg-brand-cyan/10 text-brand-cyan' : 'bg-white/[0.04] text-white/50'}`}>
                          {session.score}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="No sessions yet. Start your first interview to see your history here." />
              )}
            </div>

            {/* Quick Actions */}
            <div className="col-span-1 lg:col-span-4 flex flex-col gap-4">
              <div className="bg-[#0d0e11] border border-white/[0.06] rounded-2xl p-6 flex-1 flex flex-col gap-4">
                <h2 className="text-[13px] font-semibold text-white/50 uppercase tracking-widest">Quick Access</h2>
                <div className="flex flex-col gap-3 flex-1">
                  {[
                    { label: 'Mock Interview', desc: 'AI-powered interview practice', icon: Video, to: '/interview' },
                    { label: 'Coding Lab', desc: 'Practice DS&A problems', icon: BookOpen, to: '/coding-lab' },
                    { label: 'Performance', desc: 'Detailed analytics report', icon: Activity, to: '/analytics' },
                  ].map((item, i) => (
                    <Link
                      key={i}
                      to={item.to}
                      className="flex items-center gap-3 p-3.5 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-white/[0.04] text-white/40 group-hover:text-brand-cyan group-hover:bg-brand-cyan/10 transition-colors">
                        <item.icon size={16} />
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-white/70 group-hover:text-white transition-colors">{item.label}</p>
                        <p className="text-[10px] text-white/25 font-medium">{item.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Streak card */}
              <div className="bg-[#0d0e11] border border-white/[0.06] rounded-2xl p-6 flex justify-between items-center">
                <div>
                  <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1">Current Streak</p>
                  <p className="text-3xl font-bold text-white tracking-tight">{streak}<span className="text-[14px] text-white/30 font-semibold ml-1">{streak === 1 ? 'day' : 'days'}</span></p>
                </div>
                <div className={`p-3.5 rounded-xl ${streak > 0 ? 'bg-orange-500/10 text-orange-400' : 'bg-white/[0.04] text-white/20'}`}>
                  <Flame size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-10 py-6 border-t border-white/[0.04] flex justify-between items-center">
            <p className="text-[11px] font-medium text-white/20">PrepAI · Interview Preparation Platform</p>
            <p className="text-[11px] font-medium text-white/15">© {new Date().getFullYear()} PrepAI</p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
