import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();

const app = express();
app.set('trust proxy', 1);

const port = process.env.GATEWAY_PORT || process.env.PORT || 3001;
const authServiceUrl = process.env.AUTH_SERVICE_URL || `http://localhost:${process.env.AUTH_SERVICE_PORT || 3002}`;
const interviewServiceUrl = process.env.INTERVIEW_SERVICE_URL || `http://localhost:${process.env.INTERVIEW_SERVICE_PORT || 3003}`;

app.use(helmet());
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

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found in API gateway' });
});

app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
  console.log(`Auth service -> ${authServiceUrl}`);
  console.log(`Interview service -> ${interviewServiceUrl}`);
});
