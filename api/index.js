const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const authRoutes = require('../routes/auth');
const taskRoutes = require('../routes/tasks');
const proposalRoutes = require('../routes/proposals');
const paymentRoutes = require('../routes/payments');
const reviewRoutes = require('../routes/reviews');
const userRoutes = require('../routes/users');

const app = express();

app.use(cors({
  origin: [process.env.FRONTEND_URL, 'https://skillswap-client-seven.vercel.app', 'http://localhost:3000'].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// MongoDB in background
mongoose.connect(process.env.MONGODB_URI || '', { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log('MongoDB Connected'))
  .catch(() => {});

app.use(authRoutes);
app.use(taskRoutes);
app.use(proposalRoutes);
app.use(paymentRoutes);
app.use(reviewRoutes);
app.use(userRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

module.exports = app;
