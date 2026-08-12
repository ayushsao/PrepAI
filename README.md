# PrepCode - AI Interview Preparation Platform

PrepCode is a full-stack interview preparation platform that simulates real interview pressure using AI-driven technical conversations, coding practice, resume-aware questioning, and performance analytics. It helps candidates prepare for technical, behavioral, and role-specific interviews through interactive sessions and post-session evaluation.

## Project Overview

The platform combines:

- AI mock interviews with adaptive follow-up questions
- Resume-to-question generation from uploaded PDF resumes
- Voice-enabled interview flow (speech-to-text + text-to-speech)
- Coding lab with timed practice and AI hinting
- Interview and code evaluation endpoints returning structured feedback
- User authentication and profile management
- Progress analytics dashboard for confidence, technical depth, and skill progression

## Tech Stack

### Frontend

- React 19 + TypeScript
- Vite
- React Router
- Tailwind CSS
- Framer Motion / Motion for UI animations
- Monaco Editor for coding practice

### Backend

- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Multer + PDF parsing for resume ingestion
- Security middleware: Helmet, rate limiting, mongo sanitize, CORS

### AI and Voice Integrations

- Groq Chat Completions (interview Q&A, hints, code checks, resume analysis)
- Gemini (structured final interview evaluation)
- Groq Whisper transcription endpoint
- Browser-native text-to-speech for AI responses

## Core Features

1. Authentication
- Register, login, and protected profile routes
- JWT-based auth with protected backend endpoints

2. AI Interview Sessions
- Resume upload and parsing for personalized opening question
- Conversation state passed to AI for context-aware follow-ups
- Short, strict interviewer style for realistic simulation

3. Voice Interview Experience
- Webcam and microphone support
- Browser speech recognition for candidate responses
- AI responses spoken back via browser text-to-speech

4. Coding Lab
- Topic-based problem navigation
- Monaco-powered editor with Python/Java/C++ templates
- AI-generated coding hints (without full solution leakage)
- AI-based code evaluation endpoint returning pass/fail + feedback

5. Analytics and Progress Tracking
- Protected analytics endpoint tied to user profile
- Readiness and skill progression data
- Insight cards and session intelligence logs in frontend dashboard

## Repository Structure

```
prepcode---ai-interview-preparation/
	backend/
		config/
		controllers/
		middleware/
		models/
		routes/
		server.js
	frontend/
		src/
			components/
			hooks/
			layouts/
			pages/
			App.tsx
```

## Local Development Setup

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Atlas connection string (or local MongoDB)

### 1. Install dependencies

From the repository root:

```bash
npm run install:all
```

### 2. Configure environment variables

Create/update `backend/.env` with your own keys:

```env
PORT=3001
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:3000
```

### 3. Start full stack in development

From the repository root:

```bash
npm run dev
```

This runs:

- Frontend on port `3000` (Vite)
- Backend on port `3001` (Express)

## Production Build

```bash
npm run build
npm start
```

In production mode, Express serves the built frontend from `frontend/dist`.

## API Summary

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (protected)
- `PUT /api/auth/me` (protected)

### Interview + AI

- `POST /api/upload-resume` (protected, PDF upload)
- `POST /api/interview`
- `POST /api/evaluate`
- `POST /api/transcribe`
- `POST /api/tts`

### Coding

- `POST /api/coding-hint`
- `POST /api/evaluate-code`

### Analytics

- `GET /api/analytics` (protected)

## Notes

- Keep API keys in environment variables only; do not commit secrets.
- The frontend uses `VITE_API_URL` in development (defaults to `http://localhost:3001/api` if not set).
- Auth token is required for protected routes and analytics/resume endpoints.

## Roadmap Ideas

- Session recording and replay
- More granular rubric-based evaluation categories
- Company-specific interview packs
- Team dashboards for mentors/coaches
- Persistent coding submissions with history
