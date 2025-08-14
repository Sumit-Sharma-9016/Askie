import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { apiLimiter } from './middlewares/rateLimit.js';
import { errorHandler } from './middlewares/errorHandler.js';
import aiRoutes from './routes/aiRoutes.js';
import { connectDB } from './config/db.js';

const app = express();

// Trust reverse proxy (Render/Heroku/etc.)
app.set('trust proxy', 1);

// Allow ALL origins for testing (no cookies/credentials)
const corsAll = {
  origin: '*',
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 200,
};

// CORS first, including preflight
app.use(cors(corsAll));
app.options('*', cors(corsAll));

// Common middleware
app.use(helmet());
app.use(express.json({ limit: '4mb' }));
app.use(morgan('dev'));

// Routes
app.use('/api', apiLimiter, aiRoutes);
app.get('/health', (_req, res) => res.json({ ok: true }));

// Error handler (last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () =>
      console.log(`🚀 Server running on :${PORT}`)
    );
  })
  .catch(err => {
    console.error('DB connection failed:', err);
    process.exit(1);
  });
