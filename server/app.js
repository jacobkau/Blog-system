import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import postsRouter from './routes/posts.js';
import categoriesRouter from './routes/categories.js';
import authRouter from './routes/auth.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Allow specific frontend origins (adjust for Vercel or local dev)
const allowedOrigins = [
  'http://localhost:5173',
  'https://blog-system-ochre.vercel.app', 
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // allow cookies and headers
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// MongoDB connection
// server/app.js - Update MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Test route
app.get('/', (req, res) => {
  res.send('API is running...');
});
// server/app.js - Add a health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check MongoDB connection
    await mongoose.connection.db.admin().ping();
    
    res.status(200).json({
      status: 'healthy',
      mongo: 'connected',
      timestamp: new Date(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      mongo: 'disconnected',
      error: error.message,
      timestamp: new Date()
    });
  }
});
// Routes
app.use('/api/posts', postsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/auth', authRouter);

// Error handler (optional but good)
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT} (${process.env.NODE_ENV})`)
);
