import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import postsRouter from './routes/posts.js';
import categoriesRouter from './routes/categories.js';
import authRouter from './routes/auth.js';
import { errorHandler } from './middleware/Auth.js'; 

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

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
    credentials: true,
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

app.get('/', (req, res) => {
  res.send('API is running...');
});

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

app.use('/api/posts', postsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/auth', authRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT} (${process.env.NODE_ENV})`)
);
