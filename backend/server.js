import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { createRequire } from 'module';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
const require = createRequire(import.meta.url);
const pdfParseCommonJS = require('pdf-parse');

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { protect } from './middleware/authMiddleware.js';
import User from './models/User.js';

dotenv.config();

// Connect to database
connectDB();

const app = express();
app.set('trust proxy', 1); // Trust first proxy for express-rate-limit

const port = process.env.PORT || 3001;

// Initialize Google Gen AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "*", "'unsafe-inline'", "'unsafe-eval'", "data:", "blob:"],
      scriptSrc: ["'self'", "*", "'unsafe-inline'", "'unsafe-eval'"],
      scriptSrcElem: ["'self'", "*", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://unpkg.com"],
      connectSrc: ["'self'", "*", "'unsafe-inline'", "'unsafe-eval'", "data:", "blob:"],
      workerSrc: ["'self'", "*", "blob:"],
    },
  },
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Wait to define root route later for production serving

// Auth Routes
app.use('/api/auth', authRoutes);

// --- AI Interview Endpoints ---

const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/upload-resume', protect, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    const pdfData = await pdfParseCommonJS(req.file.buffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from the PDF' });
    }

    const systemPrompt = `You are an expert technical interviewer. Analyze the provided resume text. 
1. Extract the top 3-5 key technical skills.
2. Formulate exactly ONE introductory interview question based on the candidate's specific experience and skills.
3. CRITICAL: The introductory question must be extremely concise, conversational, and natural. Do not exceed 2 short sentences. Do not list multiple questions at once. 
Respond ONLY in JSON format like this:
{
  "skills": ["skill1", "skill2"],
  "question": "Short, sweet interview question here..."
}`;

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Here is the candidate's resume text:\n\n${resumeText.substring(0, 4000)}` }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    const data = await groqResponse.json();
    const result = JSON.parse(data.choices?.[0]?.message?.content || '{}');

    res.json({
      success: true,
      skills: result.skills || [],
      question: result.question || "Could you walk me through your background and projects?",
      resumeText: resumeText.substring(0, 4000)
    });
  } catch (error) {
    console.error('Error processing resume:', error);
    res.status(500).json({ error: 'Failed to process resume' });
  }
});

// Endpoint to handle the interview chat session
app.post('/api/interview', async (req, res) => {
  try {
    const { messages, context } = req.body;

    // Construct system prompt for the AI interviewer
    const systemInstruction = `You are a strict, highly rigorous Principal Staff Engineer conducting a full comprehensive interview for a ${context?.role || 'Software Engineer'} role at a top-tier tech company.
Rules for you:
1. Do not break character. Be polite but extremely analytical, highly demanding, and probing. No hand-holding.
2. You must drive the entire interview yourself. Progress naturally from Introduction -> Skills -> Projects -> Academic/Experience -> HR/Behavioral over the course of 10-12 questions. 
3. DO NOT wait for the user to change topics. YOU transition the topics smoothly when ready. Go from basic to advanced.
4. Base your technical questions heavily on the candidate's resume below (if provided). If they give a superficial answer, aggressively drill down into edge cases, scalability, or low-level implementation details.
5. CRITICAL RULE: Keep responses EXTREMELY short and conversational (1 to 2 short sentences MAX). NEVER bundle multiple questions together. Ask exactly ONE specific follow-up question per turn to keep the flow feeling like a real human conversation.

Candidate Resume Context:
${context?.resumeText || 'No specific resume provided.'}`;
    const groqMessages = [
      { role: 'system', content: systemInstruction },
      ...messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      }))
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: groqMessages,
        temperature: 0.7,
        max_tokens: 200,
      })
    });

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || "I'm sorry, could you repeat that? I didn't quite catch it.";

    res.json({ message: aiMessage });
  } catch (error) {
    console.error('Error generating AI response:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// Endpoint to handle AI Voice TTS (ElevenLabs / Fallback)
app.post('/api/tts', async (req, res) => {
  try {
    const { text } = req.body;

    if (!process.env.ELEVENLABS_API_KEY) {
      return res.status(400).json({ error: 'ELEVENLABS_API_KEY is not configured.' });
    }

    const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });

    // We will stream back the raw audio data
    const audioStream = await client.textToSpeech.convert(
      "EXAVITQu4vr4xnSDxMaL", // Sarah / professional voice
      {
        text: text,
        model_id: "eleven_multilingual_v2",
        output_format: "mp3_44100_128"
      }
    );

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': 'attachment; filename="speech.mp3"',
    });

    audioStream.pipe(res);
  } catch (error) {
    console.error('Error generating audio:', error);
    res.status(500).json({ error: 'Failed to generate audio', details: error.message });
  }
});

// Endpoint to transcribe user voice via Groq Whisper API
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio file uploaded' });

    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    const formData = new FormData();
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('response_format', 'json');
    formData.append('language', 'en'); // Force English or make dynamic

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        // Do not set Content-Type header manually when using FormData in fetch, 
        // it gets generated automatically with the boundary
      },
      body: formData
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message || 'Groq Transcription failed');
    }

    res.json({ text: data.text });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
});

// Endpoint to evaluate an entire interview transcript
app.post('/api/evaluate', async (req, res) => {
  try {
    const { messages, context } = req.body;
    const transcript = messages.map(m => `${m.role === 'user' ? 'Candidate' : 'Interviewer'}: ${m.content}`).join('\n');

    const systemInstruction = `You are a strict, incredibly high-bar Principal Staff Engineer evaluating a candidate's final technical round for a ${context?.role || 'Senior Software Engineer'} role.
Review the transcript strictly. Provide a brutal, highly analytical JSON evaluation. Include:
{
  "confidenceScore": (number 1-100, be strict),
  "communicationSkills": (string snippet analyzing their precision and clarity),
  "technicalAccuracy": (number 1-100, analyze technical depth and flaws),
  "strengths": (array of 3 strings, only true strong points),
  "weaknesses": (array of 3 strings, ruthless identification of technical gaps),
  "feedback": (string paragraph of hard-hitting, actionable engineering advice)
}
Return only valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: transcript }] }],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2,
        responseMimeType: "application/json",
      }
    });

    const assessment = JSON.parse(response.text);
    res.json(assessment);
  } catch (error) {
    console.error('Error generating AI evaluation:', error);
    res.status(500).json({ error: 'Failed to generate evaluation' });
  }
});

// Endpoint for Coding Lab hints
app.post('/api/coding-hint', async (req, res) => {
  try {
    const { problem, code, language, context } = req.body;

    const systemInstruction = `You are a Senior Software Architect helping a candidate with a coding problem: ${problem}.
Language: ${language}.
Current Code: ${code}.
The candidate is asking for a hint. Provide a VERY concise hint (1-2 sentences). 
Focus on the algorithm or identifying a logic error. Do NOT provide the full solution code.
Hint should be encouraging and architectural.`;

    const groqMessages = [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: "Provide a subtle hint to help me proceed without giving the answer away." }
    ];

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: groqMessages,
        temperature: 0.5,
        max_tokens: 150,
      })
    });

    const data = await groqResponse.json();
    const hintText = data.choices?.[0]?.message?.content || "Focus on the algorithmic logic and break the problem down into smaller steps.";

    res.json({ hint: hintText });
  } catch (error) {
    console.error('Error generating coding hint:', error);
    res.status(500).json({ hint: "Focus on the palindromic expansion logic around each center character." });
  }
});

// Endpoint for Code Evaluation
app.post('/api/evaluate-code', async (req, res) => {
  try {
    const { problem, code, language, description } = req.body;

    const systemInstruction = `You are a strict, Senior Software Engineer evaluating a candidate's submitted code.
Problem: ${problem}
Description: ${description}
Language: ${language}
Submitted Code:
${code}

You must evaluate the code and determine if it correctly solves the problem efficiently and handles edge cases.
Return a STRICT JSON object in the following format (NO MARKDOWN WRAPPERS, NO BACKTICKS):
{
  "passed": true/false,
  "feedback": "A concise paragraph explaining why it passed or failed."
}`;

    const groqMessages = [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: "Evaluate my code and return JSON." }
    ];

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: groqMessages,
        temperature: 0.1,
      })
    });

    const data = await groqResponse.json();
    let textResponse = data.choices?.[0]?.message?.content || '{"passed": false, "feedback": "Evaluation failed to generate"}';

    // Better JSON extraction from markdown or chatty AI responses
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      textResponse = jsonMatch[0];
    }

    try {
      const result = JSON.parse(textResponse);
      res.json(result);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError, '\nResponse Text:', textResponse, '\nRaw Data:', JSON.stringify(data));
      throw parseError;
    }
  } catch (error) {
    console.error('Error evaluating code [FULL ERROR]:', error.message, error.stack);
    res.status(500).json({ passed: false, feedback: `Error evaluating code: ${error.message}` });
  }
});

app.post('/api/save-session', protect, async (req, res) => {
  try {
    const { role, score, questions, fillers } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.analytics) user.analytics = {};
    if (!user.analytics.recentSessions) user.analytics.recentSessions = [];

    user.analytics.recentSessions.unshift({
      role: role,
      date: new Date().toISOString().split('T')[0],
      score: score,
      fillers: fillers,
      questions: questions,
    });

    if (user.analytics.recentSessions.length > 5) user.analytics.recentSessions.pop();

    if (typeof user.analytics.readiness !== 'number') user.analytics.readiness = 12;
    user.analytics.readiness = Math.min(100, user.analytics.readiness + 5);
    user.analytics.streak = (user.analytics.streak || 0) + 1;

    if (user.analytics.progressionData && user.analytics.progressionData.baselinePoints) {
      const pts = user.analytics.progressionData.baselinePoints;
      const lastPt = pts[pts.length - 1];
      user.analytics.progressionData.baselinePoints[pts.length - 1] = Math.min(100, lastPt + 5);
    }

    user.markModified('analytics');
    await user.save();
    res.json({ success: true, analytics: user.analytics });
  } catch (error) {
    console.error('Error saving session:', error);
    res.status(500).json({ error: 'Failed to save session' });
  }
});

// Analytics Endpoint (Protected - Returns real user data)
app.get('/api/analytics', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If user hasn't generated analytics yet, prepare dynamic baseline ones
    if (!user.analytics || Object.keys(user.analytics).length === 0) {
      user.analytics = {
        readiness: 12, // Starting low for a real fresh user
        breakdown: {
          technical: 15,
          communication: 10,
          behavioral: 11
        },
        streak: 1, // First day
        metrics: {
          confidence: { value: '45%', change: '+1%' },
          technical: { value: '2.5/10', change: '+0.1' },
          content: { value: 'Needs Work', change: 'Starting' },
          filler: { value: '8.2%', change: '-0.1%' }
        },
        skillProficiency: [
          { skill: user.targetRole || 'Software Engineering', score: 18 },
          { skill: 'System Design', score: 12 },
          { skill: 'Behavioral Clarity', score: 15 },
          { skill: 'Problem Solving', score: 20 },
          { skill: 'Data Structures', score: 17 }
        ],
        progressionData: {
          targetPoints: [50, 55, 65, 80, 95], // Climbing up to their goals
          baselinePoints: [10, 15, 12, 10, 12],
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5']
        },
        aiInsight: `AI Insight: Welcome ${user.name.split(' ')[0]}. Focus on the basics of ${user.targetRole || 'development'} to improve your baseline scores.`,
        recentSessions: []
      };
      await user.save();
    }

    res.json(user.analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (req, res) => {
    if (req.path.match(/\.(js|css|json|map|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
      return res.status(404).send('Not Found');
    }
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('PrepAI Backend API is running... (Development Mode)');
  });
}

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Backend Server running on port ${port}`);
});
