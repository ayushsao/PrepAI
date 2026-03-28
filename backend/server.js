import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { protect } from './middleware/authMiddleware.js';
import User from './models/User.js';

dotenv.config();

// Connect to database
connectDB();

const app = express();
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

// Endpoint to handle the interview chat session
app.post('/api/interview', async (req, res) => {
  try {
    const { messages, context } = req.body;
    
    // Construct system prompt for the AI interviewer
    const systemInstruction = `You are a professional technical interviewer for the role: ${context?.role || 'Senior Software Engineer'}. 
You are conducting a ${context?.type || 'Technical'} interview.
Keep your responses very concise and conversational (1-3 sentences max). Ask one follow-up question at a time.
Provide realistic feedback if the user asks for it. Do not break character. Do not use overly complicated metaphors unless relevant.`;

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

// Endpoint to evaluate an entire interview transcript
app.post('/api/evaluate', async (req, res) => {
  try {
    const transcript = messages.map(m => `${m.role === 'user' ? 'Candidate' : 'Interviewer'}: ${m.content}`).join('\n');
    
    const systemInstruction = `You are an expert technical recruiter evaluating an interview for a ${context?.role || 'Software Engineer'}.
Review the transcript and provide a strict JSON response evaluating the candidate. Include:
{
  "confidenceScore": (number 1-10),
  "communicationSkills": (string snippet),
  "technicalAccuracy": (number 1-10, or null if non-technical),
  "strengths": (array of 3 strings),
  "weaknesses": (array of 2 strings),
  "feedback": (string paragraph of actionable advice)
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
