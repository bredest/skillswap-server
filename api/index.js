const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

// Import routes
const authRoutes = require('../routes/auth');
const taskRoutes = require('../routes/tasks');
const proposalRoutes = require('../routes/proposals');
const paymentRoutes = require('../routes/payments');
const reviewRoutes = require('../routes/reviews');
const userRoutes = require('../routes/users');

const app = express();

// CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'https://skillswap-client-seven.vercel.app',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
}));

app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check - MUST be first, before any middleware
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// MongoDB - connect in background, don't block requests
let dbReady = false;
mongoose.connect(process.env.MONGODB_URI || '', {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 10000,
})
  .then(() => { dbReady = true; console.log('MongoDB Connected'); })
  .catch(() => { console.log('MongoDB not available, running without DB'); });

// Routes
app.use(authRoutes);
app.use(taskRoutes);
app.use(proposalRoutes);
app.use(paymentRoutes);
app.use(reviewRoutes);
app.use(userRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// Vercel handler
module.exports = app;
