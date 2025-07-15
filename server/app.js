import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';


// Load environment variables
dotenv.config({ path: './.env' });

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'https://blog-system-ochre.vercel.app/',
  credentials: true
}));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Import route files
import postsRouter from './routes/posts.js';
import categoriesRouter from './routes/categories.js';
import authRouter from './routes/auth.js';

// Mount routers
app.use('/api/posts', postsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/auth', authRouter);
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
