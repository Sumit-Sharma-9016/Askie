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

// Trust reverse proxy (needed if behind Render/Heroku/etc. for correct IPs)
app.set('trust proxy', 1);

// Allowed origins list
const allowedOrigins = process.env.CLIENT_ORIGIN?.split(',') || [];

// Common CORS options
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Allow CLI, Postman, mobile apps
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

// Global middleware
app.use(helmet());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle all preflight requests
app.use(express.json({ limit: '4mb' }));
app.use(morgan('dev'));

// Routes
app.use('/api', apiLimiter, aiRoutes); // No need to reapply cors() here
app.get('/health', (_req, res) => res.json({ ok: true }));

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch(err => {
    console.error('DB connection failed:', err);
    process.exit(1);
  });
