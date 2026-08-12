import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
app.set('trust proxy', 1);

const port = process.env.GATEWAY_PORT || process.env.PORT || 3001;
const authServiceUrl = process.env.AUTH_SERVICE_URL || `http://localhost:${process.env.AUTH_SERVICE_PORT || 3002}`;
const interviewServiceUrl = process.env.INTERVIEW_SERVICE_URL || `http://localhost:${process.env.INTERVIEW_SERVICE_PORT || 3003}`;

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
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
  })
);

app.get('/health', (_req, res) => {
  res.json({
    service: 'api-gateway',
    status: 'ok',
    routes: {
      auth: authServiceUrl,
      interview: interviewServiceUrl,
    },
  });
});

app.use(
  '/api/auth',
  createProxyMiddleware({
    target: authServiceUrl,
    changeOrigin: true,
    pathRewrite: (path) => `/api/auth${path}`,
    logLevel: 'warn',
  })
);

app.use(
  '/api',
  createProxyMiddleware({
    target: interviewServiceUrl,
    changeOrigin: true,
    pathRewrite: (path) => `/api${path}`,
    logLevel: 'warn',
  })
);

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
  // Otherwise, if route not found
  app.use((_req, res) => {
    res.status(404).json({ message: 'Route not found in API gateway' });
  });
}

app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
  console.log(`Auth service -> ${authServiceUrl}`);
  console.log(`Interview service -> ${interviewServiceUrl}`);
});
