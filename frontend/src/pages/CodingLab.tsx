import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  Code2, 
  LayoutDashboard, 
  Send, 
  Bot, 
  Layout, 
  Clock, 
  Sparkles, 
  ChevronDown, 
  Settings, 
  Maximize2,
  Minimize2,
  AlertCircle,
  Video,
  Loader2,
  Activity,
  RotateCcw,
  Plus,
  Database,
  ArrowLeft,
  ChevronRight,
  List
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Editor as MonacoEditor, loader } from '@monaco-editor/react';

// Use unpkg CDN instead of jsDelivr for Monaco Editor to fix online loading issues/blocks
loader.config({ paths: { vs: 'https://unpkg.com/monaco-editor@0.46.0/min/vs' } });

const TOPICS = [
  { id: 'arrays', name: 'Arrays & Hashing', count: 30, icon: LayoutDashboard, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  { id: 'strings', name: 'Strings', count: 25, icon: Code2, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
  { id: 'math', name: 'Math & Geometry', count: 20, icon: Bot, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  { id: 'two-pointers', name: 'Two Pointers', count: 15, icon: ChevronRight, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
  { id: 'dp', name: 'Dynamic Programming', count: 45, icon: Activity, color: 'text-brand-cyan', bg: 'bg-brand-cyan/10', border: 'border-brand-cyan/20' },
  { id: 'graphs', name: 'Graphs', count: 35, icon: Terminal, color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/20' }
];

const getMockQuestions = (topicName: string, solvedSet: Set<string> = new Set()) => {
  return Array.from({ length: 30 }, (_, i) => {
    const qId = `${topicName}-q${i + 1}`;
    let isSolvedByDefault = i === 0;
    
    return {
      id: qId,
      originalId: `q${i + 1}`,
      title: i === 0 && topicName.includes('Array') ? "Two Sum" :
             i === 1 && topicName.includes('Array') ? "Best Time to Buy and Sell Stock" :
             i === 0 && topicName.includes('String') ? "Valid Palindrome" :
             `${topicName} Protocol ${i + 1}`,
      difficulty: i % 4 === 0 ? 'Hard' : i % 2 === 0 ? 'Medium' : 'Easy',
      status: solvedSet.has(qId) || isSolvedByDefault ? 'solved' : (i === 1 ? 'attempted' : 'todo'),
      acceptance: `${Math.floor(Math.random() * 40 + 40)}%`,
    };
  });
};

const LANGUAGE_CONFIGS = {
  python: {
    label: 'Python 3',
    compiler: 'CPython 3.11',
    starter: `class Solution:
    def longestPalindrome(self, s: str) -> str:
        # Initialize result variables
        res = ""
        resLen = 0

        for i in range(len(s)):
            # odd length
            l, r = i, i
            while l >= 0 and r < len(s) and s[l] == s[r]:
                if (r - l + 1) > resLen:
                    res = s[l:r+1]
                    resLen = r - l + 1
                l -= 1
                r += 1

            # even length expansion logic here...
            return res`,
  },
  cpp: {
    label: 'C++',
    compiler: 'Clang 16.0',
    starter: `#include <iostream>
#include <string>
#include <vector>

class Solution {
public:
    std::string longestPalindrome(std::string s) {
        int n = s.length();
        if (n < 2) return s;
        // Optimal O(N^2) expansion approach
        return "";
    }
};`,
  },
  java: {
    label: 'Java',
    compiler: 'OpenJDK 21',
    starter: `class Solution {
    public String longestPalindrome(String s) {
        int n = s.length();
        if (n < 2) return s;
        // Palindromic implementation
        return "";
    }
}`,
  }
};

const CodingLab = () => {
  const [view, setView] = useState<'topics' | 'questions' | 'editor'>('topics');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);
  const [solvedQuestions, setSolvedQuestions] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [language, setLanguage] = useState<keyof typeof LANGUAGE_CONFIGS>('python');
  const [code, setCode] = useState(LANGUAGE_CONFIGS.python.starter);
  const [isRunning, setIsRunning] = useState(false);
  const [isAskingHint, setIsAskingHint] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'console' | 'testcases'>('console');
  const [selectedCase, setSelectedCase] = useState(0);
  const [timeLeft, setTimeLeft] = useState(2688);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editorSettings, setEditorSettings] = useState({
    fontSize: 15,
    minimap: false,
    wordWrap: 'off' as 'on' | 'off',
  });

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (editorContainerRef.current) {
        editorContainerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.documentElement.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const [testCases, setTestCases] = useState([
    { id: 1, name: 'Case 1', input: 'babad', expected: 'bab' },
    { id: 2, name: 'Case 2', input: 'cbbd', expected: 'bb' }
  ]);

  const [testResults, setTestResults] = useState<any[]>([]);

  const handleAskHint = async () => {
    if (isAskingHint) return;
    setIsAskingHint(true);
    try {
      const API_BASE = (import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:3001/api')).replace(/\/$/, '');
      const resp = await fetch(`${API_BASE}/coding-hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: "Longest Palindromic Substring",
          code,
          language: LANGUAGE_CONFIGS[language].label,
        })
      });
      const data = await resp.json();
      setHint(data.hint);
    } catch (e) {
      console.error(e);
      setHint("Consider how a palindrome expands outwards from its center. You can check for odd and even lengths separately.");
    } finally {
      setIsAskingHint(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleLogs]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour12: false });
    setConsoleLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  const handleSubmitSolution = async () => {
    if (view !== 'editor' || !selectedQuestion) {
      // For visual feedback, prompt user to go to a question first if clicked from generic menu
      return;
    }
    
    setIsSubmitting(true);
    addLog("Evaluating solution using AI...");

    try {
      const API_BASE = (import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:3001/api')).replace(/\/$/, '');
      const response = await fetch(`${API_BASE}/evaluate-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: selectedQuestion.title,
          description: selectedQuestion.description,
          code: code,
          language: language
        })
      });

      if (!response.ok) throw new Error("Evaluation failed");
      
      const data = await response.json();
      
      if (data.passed) {
        setSolvedQuestions(prev => new Set(prev).add(selectedQuestion.id));
        setShowSuccessModal(true);
        addLog(`✅ Solution accepted! AI Feedback: ${data.feedback}`);
      } else {
        addLog(`❌ Solution failed or needs improvement. AI Feedback: ${data.feedback}`);
      }
    } catch (err) {
      addLog("❌ Error: Could not connect to AI evaluation server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRunCode = async () => {
    if (!isSharingScreen) {
      const isShared = await toggleScreenShare();
      if (!isShared) {
        addLog("Execution stopped: Screen sharing is required to run the code.");
        return;
      }
    }

    setIsRunning(true);
    setActiveTab('console');
    setConsoleLogs([]);
    setTestResults(testCases.map(tc => ({ ...tc, status: 'running', output: null })));
    
    addLog(`Initializing ${LANGUAGE_CONFIGS[language].compiler} environment on Wandbox server...`);

    const compilerMap: Record<string, string> = {
      python: 'cpython-3.10.15',
      cpp: 'gcc-head',
      java: 'openjdk-jdk-21+35'
    };

    let passedCount = 0;
    const totalCases = testCases.length;

    for (let i = 0; i < totalCases; i++) {
      const tc = testCases[i];
      addLog(`Running Case ${tc.id}: "${tc.input}"...`);

      try {
        const response = await fetch('https://wandbox.org/api/compile.json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            compiler: compilerMap[language as string],
            code: code,
            stdin: tc.input || ''
          })
        });

        const data = await response.json();
        console.log(`Wandbox response for Case ${tc.id}:`, data);

        if (data.status === '0') {
          const runOutput = (data.program_output || '').trim();
          const isPass = runOutput === tc.expected.trim();
          
          if (isPass) {
            passedCount++;
            addLog(`Case ${tc.id} ... PASS`);
          } else {
            addLog(`Case ${tc.id} ... FAIL`);
            addLog(`Expected: "${tc.expected}", got: "${runOutput}"`);
          }

          setTestResults(prev => prev.map(res => 
            res.id === tc.id ? { ...res, status: isPass ? 'passed' : 'failed', output: runOutput } : res
          ));

        } else {
          const errorOut = data.compiler_error || data.program_error || data.compiler_message || 'Unknown Error';
          addLog(`Case ${tc.id} ... FAIL (Compilation/Runtime Error)`);
          addLog(`Error:\n${errorOut}`);
          setTestResults(prev => prev.map(res => 
            res.id === tc.id ? { ...res, status: 'failed', output: 'Error' } : res
          ));
          break; // Stop running subsequent test cases on compile error
        }
      } catch (error: any) {
        addLog(`Case ${tc.id} ... ERROR`);
        addLog(`Failed to connect: ${error.message}`);
        setTestResults(prev => prev.map(res => 
          res.id === tc.id ? { ...res, status: 'failed', output: 'Server Error' } : res
        ));
        break;
      }
    }

    addLog(`Execution finished. ${passedCount}/${totalCases} tests passed.`);
    setIsRunning(false);
  };

  const handleLanguageChange = (langId: keyof typeof LANGUAGE_CONFIGS) => {
    setLanguage(langId);
    setCode(LANGUAGE_CONFIGS[langId].starter);
    setShowLanguageDropdown(false);
    setConsoleLogs([]);
    setTestResults([]);
  };

  const toggleScreenShare = async (): Promise<boolean> => {
    if (isSharingScreen && videoRef.current) {
      const tracks = (videoRef.current.srcObject as MediaStream)?.getTracks();
      tracks?.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsSharingScreen(false);
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true,
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsSharingScreen(true);
      }
      
      // Handle the user clicking "Stop sharing" on the browser's native floating bar
      stream.getVideoTracks()[0].onended = () => {
        setIsSharingScreen(false);
        if (videoRef.current) videoRef.current.srcObject = null;
      };
      return true;
    } catch (err) {
      console.error("Error sharing screen: ", err);
      return false;
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#0a0a0c] text-white overflow-hidden font-sans selection:bg-brand-cyan/30">
      {/* Top Header */}
      <header className="h-auto md:h-14 py-3 md:py-0 border-b border-white/5 bg-[#0a0a0c] flex flex-col md:flex-row items-center justify-between px-4 md:px-6 shrink-0 relative z-50 shadow-2xl gap-3 md:gap-0">
        <div className="flex items-center justify-between w-full md:w-auto md:gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-cyan rounded flex items-center justify-center">
              <Layout className="w-4 h-4 text-brand-dark" />
            </div>
            <span className="text-lg font-bold tracking-tight">PrepAI</span>
          </Link>
          <nav className="items-center gap-6 hidden md:flex">
            <Link to="/dashboard" className="text-xs font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest">Dashboard</Link>
            <Link to="/coding-lab" className="text-xs font-bold text-brand-cyan uppercase tracking-widest border-b-2 border-brand-cyan py-4">Coding Lab</Link>
            <Link to="/interview" className="text-xs font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest">Mock Interviews</Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-between md:justify-end overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 bg-brand-cyan/10 border border-brand-cyan/20 px-3 md:px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(0,255,255,0.1)] shrink-0">
            <Clock className="w-3.5 h-3.5 text-brand-cyan" />
            <span className="text-sm font-mono font-bold text-brand-cyan tracking-wider">{formatTime(timeLeft)}</span>
          </div>
          <button onClick={handleAskHint} disabled={isAskingHint || view !== 'editor'} className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] md:text-xs font-bold hover:bg-white/10 transition-all text-white/70 disabled:opacity-50 shrink-0">
            {isAskingHint ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />}
            <span className="whitespace-nowrap">Ask AI Hint</span>
          </button>
          <button 
            onClick={handleSubmitSolution}
            disabled={isSubmitting || view !== 'editor'}
            className="px-4 md:px-6 py-1.5 md:py-2 bg-brand-cyan text-brand-dark text-[10px] md:text-xs font-bold rounded-lg glow-button hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center min-w-[110px] md:min-w-[140px] shrink-0"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Solution"}
          </button>
        </div>
      </header>

      <main className="flex-1 min-h-0 max-h-full overflow-hidden flex flex-col bg-[#0a0a0c]">
        {view === 'topics' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
            <div className="max-w-6xl mx-auto space-y-12">
              <div className="space-y-4">
                <h1 className="text-4xl font-black tracking-tight text-white">Coding Topics</h1>
                <p className="text-white/50 text-sm max-w-2xl">Select a topic to start practicing. Master foundational patterns before moving to advanced algorithms.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {TOPICS.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => {
                      setSelectedTopic(topic.name);
                      setView('questions');
                    }}
                    className={`p-6 rounded-2xl border ${topic.border} bg-[#0f0f12] hover:bg-[#15151a] transition-all group text-left relative overflow-hidden flex flex-col justify-between h-48`}
                  >
                    <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-bl-[100%] ${topic.bg}`} />
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${topic.bg} ${topic.color}`}>
                        <topic.icon size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-white mb-1 group-hover:text-brand-cyan transition-colors">{topic.name}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{topic.count} Questions</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-8">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-8 h-1.5 rounded-full bg-white/5" />
                        ))}
                      </div>
                      <ChevronRight size={20} className="text-white/20 group-hover:text-brand-cyan transform group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'questions' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => setView('topics')}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors text-white/70"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-brand-cyan mb-1">Topic</div>
                    <h1 className="text-3xl font-black tracking-tight text-white">{selectedTopic}</h1>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold bg-[#0f0f12] border border-white/5 p-2 rounded-xl">
                  <div className="px-4 border-r border-white/10">30 Questions</div>
                    <div className="px-4 text-green-400">{getMockQuestions(selectedTopic || 'General', solvedQuestions).filter(q => q.status === 'solved').length} Solved</div>
                </div>
              </div>

              <div className="bg-[#0f0f12] border border-white/5 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 bg-white/[0.02]">
                  <div className="col-span-1 text-center">Status</div>
                  <div className="col-span-6">Title</div>
                  <div className="col-span-2 text-center">Acceptance</div>
                  <div className="col-span-2 text-center">Difficulty</div>
                  <div className="col-span-1"></div>
                </div>
                <div className="divide-y divide-white/5">
                    {getMockQuestions(selectedTopic || 'General', solvedQuestions).map(q => (
                    <div key={q.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.02] transition-colors group">
                      <div className="col-span-1 flex justify-center">
                        {q.status === 'solved' && <CheckCircle2 size={18} className="text-green-500" />}
                        {q.status === 'attempted' && <RotateCcw size={18} className="text-yellow-500" />}
                        {q.status === 'todo' && <div className="w-1.5 h-1.5 rounded-full bg-white/20" />}
                      </div>
                      <div className="col-span-6 font-medium text-white/90 group-hover:text-brand-cyan transition-colors truncate">
                        {q.title}
                      </div>
                      <div className="col-span-2 text-center text-sm font-mono text-white/50">{q.acceptance}</div>
                      <div className="col-span-2 flex justify-center">
                        <span className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                          q.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          q.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                          'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {q.difficulty}
                        </span>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button 
                          onClick={() => {
                            setSelectedQuestion(q);
                            setView('editor');
                          }}
                          className="px-4 py-1.5 bg-brand-cyan/10 text-brand-cyan text-xs font-bold rounded hover:bg-brand-cyan/20 transition-colors"
                        >
                          Solve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'editor' && (
          <div className="flex-1 w-full flex flex-col lg:grid lg:grid-cols-12 bg-brand-dark overflow-y-auto lg:overflow-hidden custom-scrollbar">
            {/* Left Panel */}
            <div className="lg:col-span-4 lg:h-full border-b lg:border-b-0 lg:border-r border-white/5 overflow-y-auto p-6 md:p-10 flex flex-col gap-10 custom-scrollbar bg-[#0f0f12] shrink-0">
              <div className="flex-1">
                <button 
                  onClick={() => setView('questions')}
                  className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                >
                  <ArrowLeft size={12} /> Back to Problems
                </button>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-2 py-0.5 text-[10px] font-black rounded border uppercase tracking-tighter ${
                    selectedQuestion?.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    selectedQuestion?.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                    'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {selectedQuestion?.difficulty || 'Hard'}
                  </span>
                  <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-none">{selectedTopic}</span>
                </div>
                <h1 className="text-3xl font-black mb-6 tracking-tight">{selectedQuestion?.title || 'Longest Palindromic Substring'}</h1>
            <p className="text-sm text-white/60 leading-relaxed mb-8">
              Given a string <code className="px-1.5 py-0.5 bg-white/10 rounded text-brand-cyan mx-0.5">s</code>, return the longest palindromic substring in <code className="px-1.5 py-0.5 bg-white/10 rounded text-brand-cyan mx-0.5">s</code>.
            </p>

            <div className="space-y-6">
              {[1, 2].map(num => (
                <div key={num} className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Example {num}</h4>
                  <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3 shadow-inner">
                    <div className="flex gap-2 text-xs">
                      <span className="text-white/30 font-bold lowercase">Input:</span>
                      <span className="text-white/80 font-mono">s = {num === 1 ? '"babad"' : '"cbbd"'}</span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="text-white/30 font-bold lowercase">Output:</span>
                      <span className="text-white/80 font-mono">{num === 1 ? '"bab"' : '"bb"'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-10 border-t border-white/5 space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Constraints</h4>
              <ul className="space-y-4">
                <li className="text-xs text-white/50 flex items-start gap-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan mt-1.5 shrink-0" />
                  <span>1 ≤ s.length ≤ 1000</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="space-y-4 pb-8 shrink-0">
            <div className="p-6 bg-brand-cyan/5 border border-brand-cyan/20 rounded-2xl relative overflow-hidden group">
              <h3 className="text-xs font-black text-white/80 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-cyan" /> Architect Insight
              </h3>
              <p className="text-xs text-white/50 leading-loose">
                {hint || "Consider Manacher's Algorithm for an O(n) solution."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div ref={editorContainerRef} className="lg:col-span-8 flex flex-col h-full bg-[#0a0a0c] relative min-h-[600px] lg:min-h-0 overflow-hidden">
          {/* Editor Header */}
          <div className="h-12 px-6 flex items-center justify-between border-b border-white/5 bg-[#0f0f12] shrink-0">
            <div className="flex items-center gap-6">
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="flex items-center gap-2 text-xs font-bold text-white/70 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-md border border-white/5 min-w-[120px] justify-between"
                >
                  {LANGUAGE_CONFIGS[language].label} <ChevronDown className="w-3 h-3 text-white/30" />
                </button>
                <AnimatePresence>
                  {showLanguageDropdown && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 mt-2 w-full bg-[#1a1a1e] border border-white/10 rounded-lg overflow-hidden z-50">
                      {Object.entries(LANGUAGE_CONFIGS).map(([id, config]) => (
                        <button key={id} onClick={() => handleLanguageChange(id as keyof typeof LANGUAGE_CONFIGS)} className={`w-full px-4 py-2 text-left text-xs ${language === id ? 'text-brand-cyan bg-brand-cyan/5' : 'text-white/60 hover:bg-white/5'}`}>
                          {config.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex gap-1">
                <div className="relative">
                  <button 
                    className={`p-2 hover:text-white transition-colors ${showSettings ? 'text-white bg-white/10 rounded-md' : 'text-white/30'}`}
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <Settings size={16} />
                  </button>

                  <AnimatePresence>
                    {showSettings && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute left-0 top-full mt-2 w-64 bg-[#1a1a1e] border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl p-4 space-y-4"
                      >
                        <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest border-b border-white/5 pb-2">Editor Settings</h4>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-white/70">Font Size</span>
                            <div className="flex items-center gap-2 bg-black/50 rounded-md border border-white/5 px-2 py-1">
                              <button onClick={() => setEditorSettings(s => ({...s, fontSize: Math.max(10, s.fontSize - 1)}))} className="text-white/50 hover:text-white px-1">-</button>
                              <span className="text-xs text-white w-4 text-center">{editorSettings.fontSize}</span>
                              <button onClick={() => setEditorSettings(s => ({...s, fontSize: Math.min(30, s.fontSize + 1)}))} className="text-white/50 hover:text-white px-1">+</button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-white/70">Word Wrap</span>
                            <button 
                              onClick={() => setEditorSettings(s => ({...s, wordWrap: s.wordWrap === 'on' ? 'off' : 'on'}))}
                              className={`text-[10px] uppercase font-bold px-3 py-1 rounded-md transition-colors ${editorSettings.wordWrap === 'on' ? 'bg-brand-cyan/20 text-brand-cyan' : 'bg-white/5 text-white/50'}`}
                            >
                              {editorSettings.wordWrap}
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-white/70">Minimap</span>
                            <button 
                              onClick={() => setEditorSettings(s => ({...s, minimap: !s.minimap}))}
                              className={`text-[10px] uppercase font-bold px-3 py-1 rounded-md transition-colors ${editorSettings.minimap ? 'bg-brand-cyan/20 text-brand-cyan' : 'bg-white/5 text-white/50'}`}
                            >
                              {editorSettings.minimap ? 'ON' : 'OFF'}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button 
                  className="p-2 text-white/30 hover:text-white"
                  onClick={toggleFullscreen}
                  title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                  {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
              <Activity size={12} className="text-brand-cyan animate-pulse" /> Auto-Saving
            </div>
          </div>

          <div className="flex-1 relative flex bg-[#1e1e1e] overflow-hidden">
            <MonacoEditor
              height="100%"
              language={language === 'python' ? 'python' : language === 'cpp' ? 'cpp' : 'java'}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                fontFamily: '"Fira Code", "JetBrains Mono", Consolas, monospace',
                fontSize: editorSettings.fontSize,
                minimap: { enabled: editorSettings.minimap },
                wordWrap: editorSettings.wordWrap,
                lineHeight: 28,
                padding: { top: 32, bottom: 32 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                formatOnPaste: true,
              }}
              loading={
                <div className="flex flex-col items-center justify-center h-full text-brand-cyan/50 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-sm font-medium tracking-widest uppercase">Connecting to Editor...</span>
                </div>
              }
            />
          </div>

          <div className="h-[360px] bg-[#0c0c0e] border-t border-white/10 flex flex-col shrink-0 relative z-20">
            <div className="px-6 flex items-center justify-between border-b border-white/5 bg-[#0a0a0c]">
              <div className="flex gap-8 h-12">
                <button onClick={() => setActiveTab('testcases')} className={`relative text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'testcases' ? 'text-brand-cyan' : 'text-white/30 hover:text-white/60'}`}>
                  Test Cases
                  {activeTab === 'testcases' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-cyan" />}
                </button>
                <button onClick={() => setActiveTab('console')} className={`relative text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'console' ? 'text-brand-cyan' : 'text-white/30 hover:text-white/60'}`}>
                  Console Output
                  {activeTab === 'console' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-cyan" />}
                </button>
              </div>
              <button 
                onClick={handleRunCode}
                disabled={isRunning}
                className="flex items-center gap-2 px-6 py-2 bg-brand-cyan/10 border border-brand-cyan/20 rounded-lg text-xs font-bold text-brand-cyan hover:bg-brand-cyan/20 transition-all disabled:opacity-50"
              >
                {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>Run Code</span>
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col bg-[#08080a]">
              {activeTab === 'testcases' ? (
                <div className="p-8 space-y-8 h-full bg-[#08080a]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 text-[10px] font-bold text-white/60">
                        <Database size={12} className="text-brand-cyan" />
                        <span>Test Cases</span>
                      </div>
                      <div className="flex gap-2">
                        {testCases.map((tc, idx) => (
                          <button 
                            key={tc.id} 
                            onClick={() => setSelectedCase(idx)}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                              selectedCase === idx ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/40 scale-105 shadow-[0_0_15px_rgba(0,255,255,0.1)]' : 'bg-white/5 text-white/30 hover:bg-white/10'
                            }`}
                          >
                            Case {tc.id}
                          </button>
                        ))}
                        <button className="w-10 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/20 hover:text-white border border-white/5 font-bold">+</button>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">
                      <RotateCcw size={12} />
                      Reset
                    </button>
                  </div>

                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="relative group">
                      <label className="absolute -top-2 left-4 px-2 bg-[#08080a] text-[10px] font-black text-white/20 uppercase tracking-widest group-focus-within:text-brand-cyan transition-colors">
                        s =
                      </label>
                      <div className="w-full p-6 bg-white/[0.01] border border-white/5 rounded-2xl group-focus-within:border-brand-cyan/30 transition-all">
                        <input 
                          type="text" 
                          value={testCases[selectedCase].input}
                          onChange={(e) => {
                            const newCases = [...testCases];
                            newCases[selectedCase].input = e.target.value;
                            setTestCases(newCases);
                          }}
                          className="w-full bg-transparent text-lg font-mono text-white/90 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 font-mono text-xs space-y-2 h-full bg-[#08080a] custom-scrollbar overflow-y-auto">
                   {consoleLogs.length === 0 ? (
                    <div className="text-white/10 italic flex items-center gap-2">
                      <Terminal size={12} /> Execution lifecycle logs will appear here...
                    </div>
                  ) : (
                    consoleLogs.map((log, i) => (
                      <div key={i} className={log.includes('FAIL') || log.includes('Error') ? 'text-red-400' : 'text-white/60'}>
                        {log}
                      </div>
                    ))
                  )}
                  <div ref={consoleEndRef} />
                </div>
              )}
            </div>
          </div>

          <div className="absolute bottom-12 right-12 z-40">
            <div 
              onClick={toggleScreenShare}
              className={`w-52 aspect-video bg-[#1a1a1e]/80 backdrop-blur-xl rounded-2xl border-2 shadow-3xl overflow-hidden relative group hover:scale-105 transition-all cursor-pointer ${
                isSharingScreen ? 'border-red-500/40' : 'border-brand-cyan/40'
              }`}
              title={isSharingScreen ? "Click to stop sharing" : "Click to share screen"}
            >
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover transition-opacity duration-300 ${isSharingScreen ? 'opacity-100' : 'opacity-0 hidden'}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent flex items-end p-5">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${isSharingScreen ? 'bg-red-500' : 'bg-white/30'}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isSharingScreen ? 'text-red-400' : 'text-white/40'}`}>
                    {isSharingScreen ? 'Live' : 'Share'}
                  </span>
                  <span className="text-[10px] font-medium text-white/40 ml-2">{formatTime(timeLeft)}</span>
                </div>
              </div>
              {!isSharingScreen && (
                <div className="absolute inset-0 flex items-center justify-center opacity-30 mt-[-10px]">
                  <Video className="w-12 h-12" />
                </div>
              )}
            </div>
          </div>
         </div>
        </div>
        )}
      </main>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0f0f12] border border-brand-cyan/30 rounded-3xl p-10 max-w-md w-full text-center shadow-[0_0_50px_rgba(34,211,238,0.15)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-cyan/0 via-brand-cyan to-brand-cyan/0" />
              
              <div className="w-20 h-20 bg-brand-cyan/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-cyan/20">
                <CheckCircle2 size={40} className="text-brand-cyan" />
              </div>
              
              <h2 className="text-2xl font-black text-white mb-2">Solution Accepted!</h2>
              <p className="text-white/60 text-sm mb-8">
                Your code passed all the test cases. Excellent work keeping the time and space complexity optimal.
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all text-sm border border-white/5"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    setView('questions');
                  }}
                  className="flex-1 py-3 bg-brand-cyan hover:bg-brand-cyan/90 text-brand-dark rounded-xl font-black transition-all text-sm shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                >
                  Next Problem
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CodingLab;
