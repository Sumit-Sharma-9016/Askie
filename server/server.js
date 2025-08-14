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

app.use(helmet());
app.use(cors({
  origin: (process.env.CLIENT_ORIGIN?.split(',') || ['*']),
  credentials: true,
}));
app.use(express.json({ limit: '4mb' }));
app.use(morgan('dev'));

app.use('/api', apiLimiter, aiRoutes);

// check
app.get('/health', (_req, res) => res.json({ ok: true }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGODB_URI).then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}).catch(err => {
  console.error('DB connection failed:', err);
  process.exit(1);
});
