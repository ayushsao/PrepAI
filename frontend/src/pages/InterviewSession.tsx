import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Video, VideoOff, Settings, Clock, Sparkles,
  BarChart3, RotateCcw, PhoneOff, CheckCircle2, Hash, Play,
  CameraOff, Upload, ChevronRight, User,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiUrl } from '../lib/api';

// ── Interview Phases ────────────────────────────────────────────────────────
const PHASES = [
  {
    id: 'intro',
    label: 'Introduction',
    short: 'Intro',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
    systemHint: `You are a friendly, professional interviewer. This is the INTRODUCTION phase. Ask only ONE warm, welcoming intro question at a time. Start with "Tell me about yourself" or "Please give me a brief introduction." Keep your tone conversational, encouraging, and easy-going. This is NOT a technical round. Do not ask technical questions yet.`,
    opening: `Welcome — I'm glad you're here today. Let's start simply: could you please tell me a bit about yourself, your background, and what brought you to this role?`,
  },
  {
    id: 'skills',
    label: 'Skills',
    short: 'Skills',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/20',
    systemHint: `You are a friendly interviewer. This is the SKILLS phase. Ask ONE question at a time about the candidate's technical skills, tools, languages, and technologies they are comfortable with. Be conversational and encouraging. Gradually probe for depth but remain supportive. No harsh criticism.`,
    opening: `Thanks for that introduction. Now let's talk about your technical skills — what programming languages or tools are you most comfortable working with?`,
  },
  {
    id: 'projects',
    label: 'Projects',
    short: 'Projects',
    color: 'text-brand-cyan',
    bg: 'bg-brand-cyan/10',
    border: 'border-brand-cyan/20',
    systemHint: `You are a friendly interviewer. This is the PROJECTS phase. Ask ONE question at a time about the candidate's personal or academic projects. Ask about what they built, the tech stack, challenges faced, and what they learned. Be curious but encouraging.`,
    opening: `I'd love to hear about your projects. Can you walk me through one project you're particularly proud of — what did you build and what technologies did you use?`,
  },
  {
    id: 'internship',
    label: 'Internship',
    short: 'Experience',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/20',
    systemHint: `You are a friendly interviewer. This is the INTERNSHIP/EXPERIENCE phase. Ask ONE question at a time about the candidate's internship or work experience. If they have none, ask about college labs, freelance work, or open source contributions. Be supportive.`,
    opening: `Let's talk about your work experience. Have you done any internships, part-time roles, or freelance work? If so, tell me about your most recent one.`,
  },
  {
    id: 'certifications',
    label: 'Certifications',
    short: 'Certs',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/20',
    systemHint: `You are a friendly interviewer. This is the CERTIFICATIONS & LEARNING phase. Ask ONE question about certifications, online courses, hackathons, or any self-learning the candidate has done. Be enthusiastic about their growth mindset.`,
    opening: `Have you earned any certifications, completed notable online courses, or participated in hackathons recently?`,
  },
  {
    id: 'hr',
    label: 'HR Round',
    short: 'HR',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
    systemHint: `You are a warm, professional HR interviewer. This is the HUMAN RESOURCES phase. Ask ONE HR question at a time: why this company, career goals, strengths and weaknesses, salary expectations, where they see themselves in 5 years, teamwork style, handling pressure, etc. Be supportive and professional.`,
    opening: `We're in the final stretch — just a few HR questions. Why are you interested in this role, and what are you hoping to achieve in your next position?`,
  },
];

type CamState = 'requesting' | 'active' | 'denied' | 'idle';

const InterviewSession = () => {
  const { user, token } = useAuth();

  // ── Media ───────────────────────────────────────────────────────────────
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [camState, setCamState] = useState<CamState>('idle');
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // ── Interview phase ──────────────────────────────────────────────────────
  const [phaseIndex, setPhaseIndex] = useState(0);
  const currentPhase = PHASES[phaseIndex];

  // ── Session ─────────────────────────────────────────────────────────────
  const MAX_ANSWERS = 8;
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 min
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string; phase?: string }[]>([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [fillerCount, setFillerCount] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [confidenceScore, setConfidenceScore] = useState(80);
  const [questionCount, setQuestionCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0); // tracks user answers only
  const [redirectCountdown, setRedirectCountdown] = useState(10);

  const recognitionRef = useRef<any>(null);
  const isAiSpeakingRef = useRef(false);
  const isAiProcessingRef = useRef(false);
  const hasStartedRef = useRef(false);
  const phaseRef = useRef(0);

  useEffect(() => { isAiSpeakingRef.current = isAiSpeaking; }, [isAiSpeaking]);
  useEffect(() => { isAiProcessingRef.current = isAiProcessing; }, [isAiProcessing]);
  useEffect(() => { hasStartedRef.current = hasStarted; }, [hasStarted]);
  useEffect(() => { phaseRef.current = phaseIndex; }, [phaseIndex]);

  // ── CAMERA: Video-only, 3-tier fallback ─────────────────────────────────
  const startCamera = useCallback(async () => {
    setCamState('requesting');
    const tiers = [
      { video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } },
      { video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } },
      { video: true },
    ];
    for (const constraint of tiers) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraint);
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCamState('active');
        return;
      } catch (err: any) {
        const n = err?.name || '';
        if (n === 'NotAllowedError' || n === 'PermissionDeniedError') {
          setCamState('denied'); return;
        }
      }
    }
    setCamState('denied');
  }, []);

  useEffect(() => {
    startCamera();
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, [startCamera]);

  useEffect(() => {
    streamRef.current?.getVideoTracks().forEach(t => (t.enabled = videoOn));
  }, [videoOn]);

  useEffect(() => {
    if (videoRef.current && streamRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = streamRef.current;
    }
  });

  // ── Timer ────────────────────────────────────────────────────────────────
  const fmt = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  useEffect(() => {
    if (!hasStarted) return;
    const t = setInterval(() => setTimeLeft(p => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [hasStarted]);

  // ── Speech Recognition ────────────────────────────────────────────────────
  useEffect(() => {
    // @ts-ignore
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = 'en-US';

    r.onresult = (e: any) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + ' ';
        else interim += e.results[i][0].transcript;
      }
      setLiveTranscript(interim);
      if (final) {
        setTranscript(p => p + final);
        setLiveTranscript('');
        const fillers = ['um', 'uh', 'like', 'you know', 'basically', 'literally'];
        let found = 0;
        fillers.forEach(fw => {
          const m = final.toLowerCase().match(new RegExp(`\\b${fw}\\b`, 'g'));
          if (m) found += m.length;
        });
        if (found > 0) {
          setFillerCount(p => p + found);
          setConfidenceScore(p => Math.max(40, p - found * 2));
        }
      }
    };

    r.onend = () => {
      if (hasStartedRef.current && !isAiProcessingRef.current && !isAiSpeakingRef.current) {
        try { r.start(); } catch (_) { }
      }
    };

    recognitionRef.current = r;
  }, []);

  // Preload voices
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  // Auto-submit after silence
  useEffect(() => {
    if (transcript.trim().length > 5 && hasStarted && !isAiProcessing && !isAiSpeaking) {
      const t = setTimeout(() => document.getElementById('autoSubmit')?.click(), 2000);
      return () => clearTimeout(t);
    }
  }, [transcript, hasStarted, isAiProcessing, isAiSpeaking]);

  // ── TTS ──────────────────────────────────────────────────────────────────
  const speakText = async (text: string) => {
    try { recognitionRef.current?.stop(); } catch (_) { }
    const clean = text.replace(/[*#_`]/g, '');
    setIsAiSpeaking(true);

    // Try ElevenLabs
    try {
      const res = await fetch(apiUrl('/tts'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean }),
      });
      if (!res.ok) throw new Error();
      const audio = new Audio(URL.createObjectURL(await res.blob()));
      audio.onended = () => {
        setIsAiSpeaking(false);
        if (micOn && recognitionRef.current) try { recognitionRef.current.start(); } catch (_) { }
      };
      audio.play(); return;
    } catch (_) { }

    // Fallback: browser TTS
    if (!window.speechSynthesis) { setIsAiSpeaking(false); return; }
    const utt = new SpeechSynthesisUtterance(clean);
    const voices = window.speechSynthesis.getVoices();
    const preferred = ['Microsoft Ana Online', 'Microsoft Zira', 'Google US English', 'Samantha'];
    const voice = voices.find(v => preferred.some(p => v.name.includes(p))) || voices[0];
    if (voice) utt.voice = voice;
    utt.lang = 'en-US'; utt.rate = 0.95; utt.pitch = 1.1;
    utt.onend = () => {
      setIsAiSpeaking(false);
      try { if (micOn && recognitionRef.current) recognitionRef.current.start(); } catch (_) { }
    };
    utt.onerror = () => setIsAiSpeaking(false);
    window.speechSynthesis.speak(utt);
  };

  // ── Resume Upload ──────────────────────────────────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploading(true);
    const fd = new FormData();
    fd.append('resume', e.target.files[0]);
    try {
      const res = await fetch(apiUrl('/upload-resume'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token || localStorage.getItem('prepai_token')}` },
        body: fd,
      });
      const data = await res.json();
      if (data.success) setResumeUploaded(true);
      else alert('Upload failed: ' + (data.error || 'Unknown error'));
    } catch { alert('Failed to parse resume.'); }
    finally { setIsUploading(false); }
  };

  // ── Start Interview ────────────────────────────────────────────────────────
  const handleStart = () => {
    const opening = PHASES[0].opening;
    setMessages([{ role: 'assistant', content: opening, phase: 'intro' }]);
    setQuestionCount(1);
    setHasStarted(true);
    try { recognitionRef.current?.start(); } catch (_) { }
    setTimeout(() => speakText(opening), 300);
  };

  // ── Submit Answer ──────────────────────────────────────────────────────────
  const handleSubmitAnswer = async () => {
    if (isAiProcessing || isComplete) return;
    recognitionRef.current?.stop();
    const answer = (transcript + ' ' + liveTranscript).trim();
    if (!answer) {
      speakText("I didn't quite catch that. Could you please repeat your answer?");
      return;
    }
    setTranscript('');
    setLiveTranscript('');
    const newAnsweredCount = answeredCount + 1;
    setAnsweredCount(newAnsweredCount);
    const newMessages = [...messages, { role: 'user', content: answer, phase: currentPhase.id }];
    setMessages(newMessages);
    setIsAiProcessing(true);

    // ── Check completion BEFORE fetching next AI question ──
    if (newAnsweredCount >= MAX_ANSWERS) {
      setIsAiProcessing(false);
      finishInterview();
      return;
    }

    try {
      const phase = PHASES[phaseRef.current];
      const res = await fetch(apiUrl('/interview'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          context: {
            role: user?.targetRole || 'Software Engineer',
            type: phase.label,
            systemHint: phase.systemHint,
          },
        }),
      });
      const data = await res.json();
      const reply = data.message || 'Thank you. Could you tell me more?';
      setMessages(p => [...p, { role: 'assistant', content: reply, phase: phase.id }]);
      setQuestionCount(p => p + 1);
      setConfidenceScore(p => Math.min(100, p + 3));
      speakText(reply);
    } catch {
      speakText("I'm sorry, there's a connection issue. Let's try again.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  // ── Move to next phase ────────────────────────────────────────────────────
  const handleNextPhase = () => {
    const next = Math.min(phaseIndex + 1, PHASES.length - 1);
    setPhaseIndex(next);
    setTranscript('');
    setLiveTranscript('');
    const opening = PHASES[next].opening;
    const transitionMsg = { role: 'assistant', content: opening, phase: PHASES[next].id };
    setMessages(p => [...p, transitionMsg]);
    setQuestionCount(p => p + 1);
    speakText(opening);
  };

  const repeatQuestion = () => {
    recognitionRef.current?.stop();
    const last = [...messages].reverse().find(m => m.role === 'assistant')?.content || '';
    speakText(last);
  };

  // ── Finish Interview ─────────────────────────────────────────────────────
  const finishInterview = async () => {
    // Stop mic and camera
    try { recognitionRef.current?.stop(); } catch (_) { }
    window.speechSynthesis?.cancel();
    streamRef.current?.getTracks().forEach(t => t.stop());
    setIsComplete(true);
    setHasStarted(false);

    try {
      await fetch(apiUrl('/save-session'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          role: user?.targetRole || 'Software Engineer',
          score: confidenceScore,
          questions: answeredCount,
          fillers: fillerCount
        })
      });
    } catch (err) {
      console.error('Failed to save session:', err);
    }
  };

  // Countdown redirect when complete
  useEffect(() => {
    if (!isComplete) return;
    if (redirectCountdown <= 0) {
      window.location.href = '/dashboard';
      return;
    }
    const t = setInterval(() => setRedirectCountdown(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [isComplete, redirectCountdown]);

  const lastAiMessage = [...messages].reverse().find(m => m.role === 'assistant')?.content || '';
  const phasesReached = [...new Set(messages.map(m => m.phase).filter(Boolean))].length;

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen w-full flex flex-col bg-[#08090b] text-white overflow-hidden font-sans">

      {/* ═══ INTERVIEW COMPLETE OVERLAY ═══ */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[999] bg-[#08090b] flex flex-col items-center justify-center p-6 text-center"
          >
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-cyan/[0.05] rounded-full blur-[130px]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-400/[0.06] rounded-full blur-[80px]" />
            </div>

            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 220, damping: 20 }}
              className="relative z-10 flex flex-col items-center max-w-[440px] w-full"
            >
              {/* Trophy icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
                className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6"
              >
                <CheckCircle2 size={36} className="text-emerald-400" />
              </motion.div>

              <h1 className="text-[30px] md:text-[36px] font-bold mb-2 tracking-tight">Interview Complete</h1>
              <p className="text-[13px] text-white/40 font-medium mb-8">
                You answered all <strong className="text-white/60">{MAX_ANSWERS} questions</strong>. Here's your session summary.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 w-full mb-5">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex flex-col items-center gap-1.5">
                  <span className="text-[28px] font-bold text-white">{MAX_ANSWERS}</span>
                  <span className="text-[9px] font-semibold text-white/25 uppercase tracking-widest">Answers</span>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex flex-col items-center gap-1.5">
                  <span className="text-[28px] font-bold text-white">{phasesReached}</span>
                  <span className="text-[9px] font-semibold text-white/25 uppercase tracking-widest">Sections</span>
                </div>
              </div>

              {/* Filler row */}
              <div className="w-full flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl mb-7">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                    <Hash size={14} className="text-white/30" />
                  </div>
                  <div className="text-left">
                    <p className="text-[12px] font-semibold text-white/60">Filler Words</p>
                    <p className="text-[10px] text-white/25 font-medium">
                      {fillerCount === 0 ? 'Excellent — none detected!' : `${fillerCount} detected — try reducing "um", "like", "uh"`}
                    </p>
                  </div>
                </div>
                <span className={`text-[24px] font-bold ${fillerCount === 0 ? 'text-emerald-400' : fillerCount < 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {fillerCount}
                </span>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 w-full">
                <button onClick={() => window.location.href = '/dashboard'}
                  className="flex-1 py-3.5 bg-brand-cyan text-[#08090b] rounded-xl font-bold text-[13px] hover:brightness-110 transition-all shadow-[0_8px_24px_rgba(34,211,238,0.25)]">
                  View Dashboard
                </button>
                <button onClick={() => window.location.reload()}
                  className="flex-1 py-3.5 bg-white/[0.04] hover:bg-white/10 border border-white/[0.06] rounded-xl font-semibold text-[13px] text-white/55 hover:text-white transition-all">
                  New Interview
                </button>
              </div>

              <p className="mt-5 text-[11px] text-white/20 font-medium">
                Redirecting to dashboard in <span className="text-white/40 font-bold tabular-nums">{redirectCountdown}s</span>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Navbar ── */}
      <header className="h-14 border-b border-white/[0.04] bg-[#0a0b0d] flex items-center justify-between px-5 md:px-8 shrink-0 z-50">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-[15px] font-bold tracking-tight">PrepAI</Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Camera status */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${camState === 'active' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' :
            camState === 'denied' ? 'border-red-500/30 bg-red-500/10 text-red-400' :
              camState === 'requesting' ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400 animate-pulse' :
                'border-white/10 text-white/20'
            }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${camState === 'active' ? 'bg-emerald-400' :
              camState === 'denied' ? 'bg-red-400' :
                camState === 'requesting' ? 'bg-yellow-400' : 'bg-white/20'
              }`} />
            {camState === 'active' ? 'Live' : camState === 'denied' ? 'No Camera' : camState === 'requesting' ? 'Starting...' : 'Off'}
          </div>
          {hasStarted && (
            <div className="flex items-center gap-1.5 text-white/40 tabular-nums">
              <Clock size={12} className="text-brand-cyan/60" />
              <span className="text-[12px] font-semibold font-mono">{fmt(timeLeft)}</span>
            </div>
          )}
        </div>
      </header>

      {/* ── Main body: Camera LEFT + Content RIGHT ── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">

        {/* ═══ LEFT — Full Camera Panel ═══ */}
        <div className="relative w-full md:w-[55%] lg:w-[60%] bg-black flex-shrink-0 overflow-hidden">
          {/* Video element — always rendered */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${camState === 'active' && videoOn ? 'opacity-100' : 'opacity-0'
              }`}
          />

          {/* ── Requesting overlay ── */}
          <AnimatePresence>
            {camState === 'requesting' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#0a0b0d] flex flex-col items-center justify-center gap-5">
                <div className="w-16 h-16 rounded-full border-2 border-brand-cyan/30 border-t-brand-cyan animate-spin" />
                <div className="text-center">
                  <p className="text-[14px] font-semibold text-white/60 mb-1">Starting your camera</p>
                  <p className="text-[11px] text-white/25">Please allow camera access in the browser prompt</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Denied overlay ── */}
          <AnimatePresence>
            {camState === 'denied' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#0a0b0d] flex flex-col items-center justify-center gap-6 p-10 text-center">
                <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <CameraOff size={32} className="text-red-400" />
                </div>
                <div>
                  <p className="text-[16px] font-bold text-white/80 mb-2">Camera access blocked</p>
                  <p className="text-[12px] text-white/35 leading-relaxed mb-6 max-w-xs">
                    Click the <strong className="text-white/55">🔒 lock icon</strong> in your address bar →
                    set Camera to <strong className="text-white/55">Allow</strong> → click Try Again.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button onClick={startCamera}
                      className="px-6 py-3 bg-brand-cyan text-[#08090b] rounded-xl text-[13px] font-bold hover:brightness-110 transition-all">
                      Try Again
                    </button>
                    <button onClick={() => setCamState('idle')}
                      className="px-6 py-3 bg-white/[0.06] hover:bg-white/10 border border-white/[0.08] rounded-xl text-[13px] font-semibold text-white/50 transition-all">
                      Continue without camera
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Video off placeholder ── */}
          {camState === 'active' && !videoOn && (
            <div className="absolute inset-0 bg-[#0a0b0d] flex flex-col items-center justify-center gap-3">
              <div className="w-20 h-20 rounded-full bg-white/[0.04] flex items-center justify-center">
                <User size={32} className="text-white/20" />
              </div>
              <p className="text-[12px] text-white/25 font-medium">Camera paused</p>
            </div>
          )}

          {/* ── Upload Resume overlay (pre-start) ── */}
          <AnimatePresence>
            {!hasStarted && !resumeUploaded && camState !== 'requesting' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.97 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/65 backdrop-blur-sm p-8 text-center z-10">
                <div className="w-14 h-14 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center mb-5">
                  <Upload size={22} className="text-brand-cyan" />
                </div>
                <h2 className="text-[20px] font-bold mb-2">Upload Your Resume</h2>
                <p className="text-[12px] text-white/40 mb-7 max-w-[280px] leading-relaxed font-medium">
                  The AI will personalize your interview questions based on your experience, skills, and projects.
                </p>
                <label className="relative cursor-pointer">
                  <input type="file" accept="application/pdf" onChange={handleFileUpload}
                    disabled={isUploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className={`flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-[13px] transition-all ${isUploading ? 'bg-white/10 text-white/40' :
                    'bg-brand-cyan text-[#08090b] hover:brightness-110 shadow-[0_8px_24px_rgba(34,211,238,0.3)]'
                    }`}>
                    {isUploading ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />Analyzing...</> :
                      <><Upload size={15} /> Choose PDF</>}
                  </div>
                </label>
                <button onClick={() => setResumeUploaded(true)}
                  className="mt-4 text-[10px] text-white/25 hover:text-white/50 transition-colors underline underline-offset-2">
                  Skip — use standard questions
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Start Interview overlay ── */}
          <AnimatePresence>
            {!hasStarted && resumeUploaded && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.97 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[3px] z-10 text-center p-8">
                <div className="w-16 h-16 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center mb-5">
                  <Play size={22} className="text-brand-cyan fill-current translate-x-0.5" />
                </div>
                <h2 className="text-[22px] font-bold mb-2">Ready to Begin?</h2>
                <p className="text-[12px] text-white/40 mb-2 font-medium">Your camera is on. We'll start with a friendly introduction.</p>
                <div className="flex flex-wrap gap-2 justify-center mb-8 mt-3">
                  {PHASES.map(p => (
                    <span key={p.id} className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${p.bg} ${p.border} ${p.color}`}>
                      {p.short} {p.label}
                    </span>
                  ))}
                </div>
                <button onClick={handleStart}
                  className="flex items-center gap-3 px-10 py-4 bg-brand-cyan text-[#08090b] rounded-xl font-bold text-[15px] shadow-[0_8px_30px_rgba(34,211,238,0.35)] hover:brightness-110 hover:scale-[1.02] transition-all">
                  <Play size={18} className="fill-current" /> Start Interview
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Overlays (when started) ── */}
          {hasStarted && (
            <>
              {/* Recording badge */}
              <div className={`absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md text-[10px] font-semibold tracking-widest transition-all ${!isAiSpeaking ? 'bg-red-500/20 border-red-500/30 text-red-300' : 'bg-black/50 border-white/10 text-white/40'
                }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${!isAiSpeaking ? 'bg-red-400 animate-pulse' : 'bg-white/20'}`} />
                {isAiSpeaking ? 'AI Speaking' : 'Recording'}
              </div>

              {/* Phase badge */}
              <div className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md text-[10px] font-semibold ${currentPhase.bg} ${currentPhase.border} ${currentPhase.color}`}>
                {currentPhase.label}
              </div>

              {/* Waveform */}
              <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="flex gap-0.5 items-end h-5">
                  {[1, 2, 3, 4, 5, 6].map((_, i) => (
                    <motion.div key={i}
                      animate={{ height: isAiSpeaking ? ['20%', '100%', '40%', '80%', '20%'] : '20%' }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.1 }}
                      className="w-0.5 bg-brand-cyan rounded-full"
                    />
                  ))}
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-brand-cyan">Interviewer</p>
                  <p className="text-[9px] text-white/30 mt-0.5">
                    {isAiSpeaking ? 'Speaking...' : isAiProcessing ? 'Processing...' : 'Listening'}
                  </p>
                </div>
              </div>

              {/* Live transcript preview */}
              {(transcript || liveTranscript) && (
                <div className="absolute bottom-4 right-4 max-w-[55%] bg-black/70 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3">
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-white/30 mb-1">You</p>
                  <p className="text-[11px] text-white/60 leading-relaxed line-clamp-3">
                    {(transcript + ' ' + liveTranscript).trim().slice(-150)}
                    {liveTranscript && <span className="text-white/30 italic"> {liveTranscript}</span>}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* ═══ RIGHT — AI Question + Analysis ═══ */}
        <div className="flex-1 flex flex-col border-l border-white/[0.04] overflow-hidden bg-[#08090b]">

          {/* AI Question panel */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-5 custom-scrollbar">

            {/* Phase progress */}
            {hasStarted && (
              <div className="flex items-center gap-2 flex-wrap">
                {PHASES.map((p, i) => (
                  <div key={p.id} className={`flex items-center gap-1 text-[10px] font-semibold ${i === phaseIndex ? `${p.color}` : i < phaseIndex ? 'text-white/30' : 'text-white/10'
                    }`}>
                    <span>{p.short}</span>
                    {i < PHASES.length - 1 && <ChevronRight size={10} className="opacity-40" />}
                  </div>
                ))}
              </div>
            )}

            {/* Current AI question */}
            <div className={`rounded-2xl p-6 border ${currentPhase.bg} ${currentPhase.border} relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/[0.03] rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${currentPhase.bg} ${currentPhase.border} ${currentPhase.color}`}>
                  {currentPhase.label}
                </span>
                {isAiProcessing && (
                  <span className="flex items-center gap-1.5 text-[10px] text-white/30 font-medium">
                    <div className="w-3 h-3 border border-white/20 border-t-white/50 rounded-full animate-spin" />
                    Thinking...
                  </span>
                )}
              </div>
              <p className="text-[16px] md:text-[18px] font-medium leading-relaxed text-white/90">
                {hasStarted ? lastAiMessage : "Your interview will start here. The AI interviewer will guide you through each section."}
              </p>
            </div>

            {/* Action buttons */}
            {hasStarted && (
              <div className="flex flex-wrap gap-3">
                <button onClick={repeatQuestion} disabled={isAiProcessing}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl text-[12px] font-semibold text-white/50 hover:text-white/80 transition-all disabled:opacity-30">
                  <RotateCcw size={13} /> Repeat
                </button>
                <button id="autoSubmit" onClick={handleSubmitAnswer}
                  disabled={isAiProcessing || (!transcript.trim() && !liveTranscript.trim())}
                  className="flex items-center gap-2 px-4 py-2.5 bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/20 text-brand-cyan rounded-xl text-[12px] font-semibold transition-all disabled:opacity-30">
                  <CheckCircle2 size={13} />
                  {isAiProcessing ? 'Processing...' : 'Submit Answer'}
                </button>
                {phaseIndex < PHASES.length - 1 && questionCount >= 2 && (
                  <button onClick={handleNextPhase} disabled={isAiProcessing}
                    className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-[12px] font-semibold transition-all disabled:opacity-30 ${PHASES[phaseIndex + 1].bg} ${PHASES[phaseIndex + 1].border} ${PHASES[phaseIndex + 1].color}`}>
                    Next: {PHASES[phaseIndex + 1].label}
                    <ChevronRight size={13} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── Analysis Panel ── */}
          <div className="border-t border-white/[0.04] p-5 md:p-6 space-y-4 bg-[#0a0b0d] shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 size={13} className="text-white/20" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white/25">Session Stats</span>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 text-center">
                <p className="text-[18px] font-bold text-white">{questionCount}</p>
                <p className="text-[9px] font-semibold text-white/25 uppercase tracking-wider mt-0.5">Questions</p>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 text-center">
                <p className="text-[18px] font-bold text-white">{fillerCount.toString().padStart(2, '0')}</p>
                <p className="text-[9px] font-semibold text-white/25 uppercase tracking-wider mt-0.5">Fillers</p>
              </div>
              <div className={`border rounded-xl p-3 text-center ${currentPhase.bg} ${currentPhase.border}`}>
                <p className={`text-[11px] font-bold ${currentPhase.color} leading-tight`}>{currentPhase.short}</p>
                <p className={`text-[9px] font-semibold uppercase tracking-wider mt-0.5 ${currentPhase.color} opacity-70`}>Phase</p>
              </div>
            </div>

            {/* Hint */}
            <div className="p-3.5 bg-white/[0.02] border border-white/[0.05] rounded-xl">
              <p className="text-[11px] text-white/35 leading-relaxed">
                {!hasStarted ? 'Complete all questions to see your session summary.' :
                  fillerCount > 5 ? 'Reduce filler words like "um" and "like" for a cleaner delivery.' :
                    phaseIndex === 0 ? 'Keep your introduction under 2 minutes and speak clearly.' :
                      phaseIndex === 1 ? 'Mention specific technologies and your proficiency level.' :
                        phaseIndex === 2 ? 'Use STAR — Situation, Task, Action, Result.' :
                          phaseIndex === 3 ? 'Focus on your key contributions and outcomes.' :
                            phaseIndex === 4 ? 'Mention the skills each certification helped you develop.' :
                              'Be direct and genuine. HR questions have no wrong answers.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer Controls ── */}
      <footer className="h-16 bg-[#0a0b0d] border-t border-white/[0.04] flex items-center justify-between px-5 md:px-8 shrink-0">
        <div className="flex items-center gap-2 text-white/30 w-24">
          <Clock size={13} className="text-brand-cyan/50" />
          <span className="text-[12px] font-semibold font-mono">{fmt(timeLeft)}</span>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setMicOn(!micOn)} title={micOn ? 'Mute mic' : 'Unmute mic'}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${micOn ? 'bg-white/[0.06] hover:bg-white/[0.12] text-white/60' : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
            {micOn ? <Mic size={18} /> : <MicOff size={18} />}
          </button>

          <button onClick={() => setVideoOn(!videoOn)} title={videoOn ? 'Turn off camera' : 'Turn on camera'}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${videoOn ? 'bg-white/[0.06] hover:bg-white/[0.12] text-white/60' : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
            {videoOn ? <Video size={18} /> : <VideoOff size={18} />}
          </button>

          {hasStarted && (
            <button onClick={() => window.location.href = '/dashboard'}
              className="h-11 px-5 bg-red-500/90 hover:bg-red-500 text-white rounded-full flex items-center gap-2 font-semibold text-[13px] transition-all shadow-[0_4px_16px_rgba(239,68,68,0.2)]">
              <PhoneOff size={16} />
              <span className="hidden sm:inline">End</span>
            </button>
          )}
        </div>

        <div className="flex justify-end w-24">
          <button className="w-9 h-9 rounded-full bg-white/[0.03] hover:bg-white/[0.07] flex items-center justify-center text-white/25 hover:text-white/50 transition-colors">
            <Settings size={15} />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default InterviewSession;
