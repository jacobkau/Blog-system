import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import postsRouter from './routes/posts.js';
import categoriesRouter from './routes/categories.js';
import authRouter from './routes/auth.js';
import uploadsRouter from './routes/uploads.js';
import { errorHandler } from './middleware/Auth.js';

dotenv.config();

const app = express();

//  CORS must come before everything else
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://blog-system-ochre.vercel.app',
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error('❌ CORS blocked origin:', origin);
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  maxAge: 86400, // Cache preflight for 24 hours
};

app.use(cors(corsOptions));

//  Handle preflight requests for ALL routes
app.options(/.*/, cors(corsOptions));

// Body + cookie parsers
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log(' MongoDB Connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Test + health
app.get('/', (req, res) => res.send('API is running...'));

app.get('/api/health', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.status(200).json({
      status: 'healthy',
      mongo: 'connected',
      timestamp: new Date(),
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      mongo: 'disconnected',
      error: error.message,
      timestamp: new Date(),
    });
  }
});

// Routes
app.use('/api/uploads', uploadsRouter);
app.use('/api/posts', postsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/auth', authRouter);

//  set CORS headers too
app.use((err, req, res, next) => {
  console.error('🚨 Error:', err.message);

  //on error, return CORS headers
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT} (${process.env.NODE_ENV})`)
);
