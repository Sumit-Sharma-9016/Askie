import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // max requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip, // IP after trust proxy
  skip: (req) => req.method === 'OPTIONS' // Don't rate-limit preflight requests
});
