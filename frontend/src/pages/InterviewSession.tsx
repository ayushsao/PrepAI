import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion'; // make sure framer-motion is used, earlier it was 'motion/react' which might be invalid
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Settings, 
  User, 
  Bot, 
  Layout, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  BarChart3, 
  Activity, 
  Smile, 
  Zap, 
  RotateCcw, 
  SkipForward, 
  PhoneOff, 
  CheckCircle2,
  Hash,
  Play
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

const InterviewSession = () => {
  const { user, token } = useAuth();
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [timeLeft, setTimeLeft] = useState(150);
  const [activeTone, setActiveTone] = useState<'professional' | 'urgent' | 'analytic'>('professional');
  
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: 'assistant', content: "Welcome. This is the technical deep-dive round. I'll be assessing your engineering rigor, problem-solving, and system-level thinking. Let's begin: walk me through the most technically complex project you've built, and highlight the exact engineering tradeoffs you made." }       
  ]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [fillerCount, setFillerCount] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [confidenceInfo, setConfidenceInfo] = useState({ score: 84, message: "Starting analysis." });

  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);

  // Robust state tracking for speech recognition auto-restart
  const isAiSpeakingRef = useRef(false);
  const isAiProcessingRef = useRef(false);
  const hasStartedRef = useRef(false);

  useEffect(() => { isAiSpeakingRef.current = isAiSpeaking; }, [isAiSpeaking]);
  useEffect(() => { isAiProcessingRef.current = isAiProcessing; }, [isAiProcessing]);
  useEffect(() => { hasStartedRef.current = hasStarted; }, [hasStarted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let stream: MediaStream;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied", err);
      }
    };
    startCamera();

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(t => t.enabled = micOn);
      stream.getVideoTracks().forEach(t => t.enabled = videoOn);
    }
  }, [micOn, videoOn]);

  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        
        if (finalTranscript) {
           setTranscript(prev => prev + finalTranscript);
           
           const fillerWords = ['um', 'uh', 'like', 'you know'];
           const lowerTranscript = finalTranscript.toLowerCase();
           let foundFillers = 0;
           fillerWords.forEach(fw => {
             const regex = new RegExp(`\\b${fw}\\b`, 'g');
             const matches = lowerTranscript.match(regex);
             if (matches) foundFillers += matches.length;
           });
           
           if (foundFillers > 0) {
             setFillerCount(prev => prev + foundFillers);
             setConfidenceInfo({
               score: Math.max(50, 84 - foundFillers * 2),
               message: "Try to reduce the use of filler words."
             });
           }
        }
      };

      // Attempt to auto-restart recognition if it stops unexpectedly (Chrome often kills it after silence)
      recognition.onend = () => {
        // ALWAYS restart listening UNLESS the AI is currently speaking or processing our answer!
        if (hasStartedRef.current && !isAiProcessingRef.current && !isAiSpeakingRef.current) {
          try {
            recognition.start();
          } catch (err) {}
        }
      };

      recognitionRef.current = recognition;
      }
    }, []);

  useEffect(() => {
    // Pre-load voices on component mount so they're ready when the user clicks Play
    if (window.speechSynthesis) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.getVoices();
        };
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(prev => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  // Hands-free auto-submit mechanism: detect silence and trigger submit
  useEffect(() => {
    let silenceTimer: NodeJS.Timeout;
    // Lowered threshold to > 3 characters so short answers trigger it too
    if (transcript.trim().length > 3 && hasStarted && !isAiProcessing && !isAiSpeaking) {
      silenceTimer = setTimeout(() => {
        document.getElementById('autoSubmitBtn')?.click();
      }, 1500); // 1.5s for faster, snappy responses
    }
    return () => clearTimeout(silenceTimer);
  }, [transcript, hasStarted, isAiProcessing, isAiSpeaking]);

  const speakText = (text: string) => {
    if (!window.speechSynthesis) {
        console.error("Speech synthesis not supported in this browser.");
        return;
    }
    
    try {
      recognitionRef.current?.stop(); // prevent AI from hearing itself
    } catch (e) {
      console.warn("Could not stop recognition:", e);
    }

    const textToSpeak = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Attempt to find the most natural, human-sounding "sweet" voice (Microsoft/Google female voices usually)
    const voices = window.speechSynthesis.getVoices();
    
    const preferredVoices = [
      "Microsoft Ana Online (Natural) - English (United States)",
      "Microsoft Michelle Online (Natural) - English (United States)",
      "Microsoft Jenny Online (Natural) - English (United States)",
      "Google US English",
      "Samantha",
      "Victoria",
      "Tessa" 
    ];

    let selectedVoice = voices.find(v => preferredVoices.some(pv => v.name.includes(pv)));
    
    if (!selectedVoice) {
      selectedVoice = voices.find(v => 
        (v.lang === 'en-US' || v.lang === 'en-GB') && 
        (v.name.includes('Female') || v.name.includes('Google') || v.name.includes('Zira'))) 
        || voices.find(v => v.lang.includes('en'));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.lang = "en-US";
    
    // Maximizing sweetness: Higher pitch, slightly slower rate to sound thoughtful and gentle
    utterance.rate = 0.98; // Slightly slowed down from 1.05 so she doesn't sound rushed
    utterance.pitch = 1.4; // Pushed higher to make it sound cuter and softer
    utterance.volume = 1;

    utterance.onstart = () => {
      console.log("Started speaking:", textToSpeak);
      setIsAiSpeaking(true);
    };
    
    utterance.onend = () => {
      console.log("Finished speaking.");
      setIsAiSpeaking(false);
      try {
        if (micOn && recognitionRef.current) {
          recognitionRef.current.start();
        }
      } catch (e) {
         console.warn("Could not start recognition:", e);
      }
    };
    
    utterance.onerror = (e) => {
      console.error("Speech synthesis error:", e);
      setIsAiSpeaking(false);
    };

    // Store utterance globally to prevent Chrome from garbage collecting it before onend fires!
    (window as any)._currUtterance = utterance;

    window.speechSynthesis.speak(utterance);

    // Workaround for Chrome bug where long texts randomly stop:
    // pause/resume every 14 seconds (though these are short sentences anyway)
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const API_BASE = (import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:3001/api')).replace(/\/$/, '');
      const response = await fetch(`${API_BASE}/upload-resume`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token || localStorage.getItem('prepai_token')}`
        },
        body: formData,
      });
      
      const data = await response.json();
      if (data.success) {
        setMessages([{ role: 'assistant', content: data.question }]);
        setResumeUploaded(true);
        console.log("Resume skills:", data.skills);
      } else {
        alert("Upload failed: " + (data.error || data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to parse resume.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleStart = () => {
    console.log("Begin Interview clicked!");
    setHasStarted(true);
    // Add a tiny delay to ensure React state paints before we lock the main thread with speech,
    // which can sometimes help browsers recognize the user gesture correctly.
    setTimeout(() => {
        const firstMessage = messages.find(m => m.role === 'assistant')?.content || "Hello.";
        speakText(firstMessage);
    }, 50);
  };

  const handleSubmitAnswer = async () => {
    if (isAiProcessing) return;
    
    recognitionRef.current?.stop();
    const candidateAnswer = transcript.trim();
    if (!candidateAnswer) {
      speakText("I didn't quite catch that. Could you please provide your answer?");
      return;
    }

    const newMessages = [...messages, { role: 'user', content: candidateAnswer }];
    setMessages(newMessages);
    setTranscript('');
    setIsAiProcessing(true);

    try {
      const API_BASE = (import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:3001/api')).replace(/\/$/, '');
      const res = await fetch(`${API_BASE}/interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          messages: newMessages,
          context: { role: user?.targetRole || 'Software Engineer', type: 'Technical' }
        })
      });
      
      const data = await res.json();
      const aiResponse = data.message || "Could you provide more details?";
      
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      speakText(aiResponse);
      
      setConfidenceInfo(prev => ({
         ...prev,
         message: "Analysis updated."
      }));
      
    } catch (err) {
      console.error("AI interview error: ", err);
      speakText("I'm sorry, there's a connection error. Could we try again?");
    } finally {
      setIsAiProcessing(false);
    }
  };
  
  const repeatQuestion = () => {
    recognitionRef.current?.stop();
    const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant')?.content || "";
    speakText(lastAssistantMsg);
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#08090b] text-white overflow-hidden font-sans">
      <header className="h-auto md:h-16 py-3 md:py-0 border-b border-white/[0.03] bg-[#0a0b0d] flex flex-col md:flex-row items-center justify-between px-4 md:px-8 shrink-0 relative z-50 gap-4 md:gap-0">
        <div className="flex items-center gap-6 md:gap-12 w-full md:w-auto justify-between md:justify-start">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">PrepAI</span>
          </Link>
          <nav className="flex items-center gap-6 md:gap-10">
            <Link to="/dashboard" className="text-[11px] font-bold text-white/40 uppercase tracking-widest hover:text-white transition-colors">Dashboard</Link>
            <Link to="/interview" className="text-[11px] font-bold text-brand-cyan uppercase tracking-widest border-b-2 border-brand-cyan py-3 md:py-5">AI Interview</Link>
          </nav>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 flex-col md:flex-row">
        <aside className="hidden md:flex w-64 border-r border-white/[0.03] bg-[#08090b] flex-col shrink-0 p-8">
          <div className="mb-12">
            <h2 className="text-lg font-bold tracking-tight mb-0.5">Architect Mode</h2>
            <div className="text-[9px] font-bold uppercase text-white/20 tracking-[0.2em]">System Active</div>
          </div>
          <nav className="space-y-3">
            <Link to="/dashboard" className="flex items-center gap-4 px-4 py-3 text-white/40 hover:text-white transition-all group">
              <Layout size={18} className="group-hover:text-brand-cyan" />
              <span className="text-xs font-bold">Dashboard</span>
            </Link>
            <Link to="/interview" className="flex items-center gap-4 px-4 py-3 bg-[#0c1a1d] text-brand-cyan rounded-lg border border-brand-cyan/20 shadow-inner">
              <User size={18} />
              <span className="text-xs font-bold">AI Mock Interviews</span>
            </Link>
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 md:p-10 flex flex-col gap-6 md:gap-8 custom-scrollbar bg-[#08090b]">
          <div className="w-full aspect-[4/3] md:aspect-video bg-[#0a0b0d] rounded-2xl md:rounded-[32px] overflow-hidden relative border border-white/5 shadow-2xl">
            
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover transition-opacity duration-500 ${videoOn ? 'opacity-100' : 'opacity-0'}`}
            />
            {!videoOn && (
               <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                 <VideoOff className="w-16 h-16 text-white/20" />
               </div>
            )}
            
            <div className="absolute top-8 left-8 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shrink-0">
               <div className={`w-2.5 h-2.5 rounded-full ${hasStarted && !isAiSpeaking ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse' : 'bg-red-500/30'}`} />
               <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">
                 {hasStarted ? 'Recording' : 'Standby'}
               </span>
            </div>

            <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 rounded-xl md:rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 p-3 md:p-5 flex items-center gap-3 md:gap-5 max-w-[calc(100%-2rem)] md:min-w-[280px]">
               <div className="flex gap-1 md:gap-1.5 items-end h-4 md:h-6 shrink-0">
                  {[3, 7, 5, 9, 4, 8].map((h, i) => (
                    <motion.div 
                      key={i} 
                      animate={{ height: isAiSpeaking ? ['20%', '100%', '40%', '80%', '20%'] : '20%' }} 
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                      className="w-0.5 md:w-1 bg-brand-cyan rounded-full" 
                    />
                  ))}
               </div>
               <div className="min-w-0">
                  <h4 className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-brand-cyan mb-0.5 truncate">AI Analyst</h4>
                  <p className="text-[9px] md:text-[10px] font-bold text-white/30 truncate">
                    {isAiSpeaking ? 'Speaking...' : hasStarted ? 'Listening for intent...' : 'Ready to start'}
                  </p>
               </div>
            </div>

            {!hasStarted && !resumeUploaded && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center z-10 p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Targeted AI Interview</h3>
                <p className="text-white/60 mb-6 max-w-md">Upload your resume. The AI Architect will analyze your experiences and generate personalized technical questions.</p>
                <div className="relative">
                  <input 
                    type="file" 
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className={`flex items-center gap-3 px-8 py-4 ${isUploading ? 'bg-gray-600' : 'bg-brand-cyan'} text-brand-dark rounded-full font-bold text-sm shadow-[0_0_40px_rgba(34,211,238,0.3)] transition-transform`}>
                    {isUploading ? 'Analyzing Resume...' : 'Upload PDF Resume'}
                  </div>
                </div>
              </div>
            )}

            {!hasStarted && resumeUploaded && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <p className="text-brand-cyan mb-6 font-bold tracking-wider uppercase text-sm">Resume Analyzed successfully</p>
                <button
                  onClick={handleStart}
                  className="flex items-center gap-3 px-8 py-4 bg-brand-cyan text-brand-dark rounded-full font-bold text-sm shadow-[0_0_40px_rgba(34,211,238,0.3)] hover:scale-105 transition-transform"
                >
                  <Play className="fill-current" />
                  Begin Interview
                </button>
              </div>
            )}
          </div>

          <div className="bg-[#0e0f12] border border-white/5 rounded-2xl md:rounded-[32px] p-6 md:p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-brand-cyan/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 space-y-6 md:space-y-8">
               <span className="px-4 md:px-5 py-2 bg-[#1b232e] text-blue-400 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] inline-block mb-2">
                 Live Feed
               </span>
               <div className="text-xl md:text-2xl lg:text-3xl font-medium leading-relaxed font-sans text-white/90 max-w-full md:max-w-[80%]">
                 {[...messages].reverse().find(m => m.role === 'assistant')?.content || "Connecting..."}
               </div>

               {transcript && (
                 <div className="mt-4 p-4 border-l-2 border-brand-cyan/40 bg-brand-cyan/5 text-white/60 text-xs md:text-sm italic">
                   ... {transcript.substring(Math.max(0, transcript.length - 100), transcript.length)}
                 </div>
               )}
               
               <div className="flex flex-col md:flex-row gap-4 pt-4">
                  <button onClick={repeatQuestion} disabled={!hasStarted || isAiProcessing} className="flex items-center justify-center md:justify-start gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-xs font-bold transition-all disabled:opacity-50">
                    <RotateCcw size={16} /> Repeat Question
                  </button>
                  <button id="autoSubmitBtn" onClick={handleSubmitAnswer} disabled={!hasStarted || isAiProcessing || !transcript.trim()} className="flex items-center justify-center md:justify-start gap-3 px-6 py-3 bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/20 rounded-2xl text-xs font-bold transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                    <CheckCircle2 size={16} /> {isAiProcessing ? 'Thinking...' : 'Submit Answer'}
                  </button>
               </div>
            </div>
          </div>
        </main>

        <aside className="w-full lg:w-[380px] border-t lg:border-t-0 lg:border-l border-white/[0.03] bg-[#08090b] p-6 md:p-8 flex flex-col gap-8 md:gap-10 shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-8">
               <BarChart3 size={18} className="text-brand-cyan" />
               <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Live Analysis</h3>
            </div>
            <div className="space-y-4 mb-10">
               <div className="flex justify-between items-end">
                 <span className="text-[11px] font-bold text-white/30 tracking-widest uppercase">Confidence Level</span>
                 <span className="text-xl font-bold text-brand-cyan">{hasStarted ? confidenceInfo.score : '--'}%</span>
               </div>
               <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-brand-cyan transition-all duration-1000" style={{ width: `${hasStarted ? confidenceInfo.score : 0}%` }}/>
               </div>
            </div>
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between mb-8">
               <div className="flex items-center gap-4">
                 <div className="p-3 bg-white/5 rounded-xl"><Hash size={18} className="text-white/20" /></div>
                 <span className="text-xs font-bold text-white/40">Filler Word Count</span>
               </div>
               <span className="text-2xl font-bold tracking-tight">{fillerCount.toString().padStart(2, '0')}</span>
            </div>
            <div className="p-6 bg-[#0f1b20] border border-brand-cyan/10 rounded-2xl relative overflow-hidden group">
               <div className="flex items-start gap-4">
                 <Sparkles size={18} className="text-brand-cyan shrink-0 mt-0.5 animate-pulse" />
                 <p className="text-xs leading-relaxed text-[#5bbaba]">
                   <span className="font-bold mr-1">Insight:</span>
                   {hasStarted ? confidenceInfo.message : "Waiting to analyze speech patterns."}
                 </p>
               </div>
            </div>
          </div>
        </aside>
      </div>

      <footer className="h-20 md:h-24 bg-[#0a0b0d] border-t border-white/[0.03] flex items-center justify-center md:justify-between px-6 md:px-10 shrink-0 relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        
        {/* Left: Time (keeps center controls perfectly centered) */}
        <div className="hidden md:flex items-center gap-3 text-white/50 w-40">
          <Clock size={16} className="text-brand-cyan/70" />
          <span className="text-sm font-bold tracking-wider font-mono">{formatTime(timeLeft)}</span>
        </div>

        {/* Center: Main Controls */}
        <div className="flex items-center justify-center gap-4 md:gap-6">
          <button
            onClick={() => setMicOn(!micOn)}
            className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all ${micOn ? 'bg-white/10 hover:bg-white/20 text-white shadow-sm' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}
            title="Toggle Microphone"
          >
            {micOn ? <Mic size={22} /> : <MicOff size={22} />}
          </button>

          <button
            onClick={() => setVideoOn(!videoOn)}
            className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all ${videoOn ? 'bg-white/10 hover:bg-white/20 text-white shadow-sm' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}
            title="Toggle Camera"
          >
            {videoOn ? <Video size={22} /> : <VideoOff size={22} />}
          </button>

          {hasStarted && (
            <button
               onClick={() => window.location.href = '/dashboard'}
               className="h-12 md:h-14 px-6 md:px-8 bg-red-500/90 hover:bg-red-500 text-white rounded-full flex items-center justify-center gap-2 font-bold transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] md:ml-4"
               title="End Interview"
            >
               <PhoneOff size={20} />
               <span className="hidden md:inline">End Session</span>
            </button>
          )}
        </div>

        {/* Right: Settings (balances flex-between) */}
        <div className="hidden md:flex items-center justify-end w-40">
           <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
              <Settings size={18} />
           </button>
        </div>
      </footer>
    </div>
  );
};

export default InterviewSession;
