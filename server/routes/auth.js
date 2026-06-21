const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const authRouter = express.Router();

// Register
authRouter.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, image, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });
    }

    if (!/[a-z]/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one lowercase letter' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const userRole = role === 'freelancer' ? 'freelancer' : 'client';

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      image: image || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
      role: userRole,
    });

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('skillswap_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        image: newUser.image,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Login
authRouter.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Account has been blocked. Contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('skillswap_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Google OAuth callback handler
authRouter.post('/api/auth/google', async (req, res) => {
  try {
    const { name, email, image } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Google user data required' });
    }

    let existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.isBlocked) {
        return res.status(403).json({ message: 'Account has been blocked' });
      }
      const token = jwt.sign({ id: existingUser._id, role: existingUser.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.cookie('skillswap_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return res.json({
        user: {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          image: existingUser.image,
          role: existingUser.role,
        },
        token,
      });
    }

    const newUser = await User.create({
      name: name || email.split('@')[0],
      email,
      image: image || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}`,
      role: 'client',
      password: await bcrypt.hash(Math.random().toString(36).slice(-12), 10),
    });

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('skillswap_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        image: newUser.image,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Google auth failed', error: error.message });
  }
});

// Get current session
authRouter.get('/api/auth/session', async (req, res) => {
  try {
    let token = req.cookies?.skillswap_token;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return res.json({ user: null });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || user.isBlocked) {
      res.clearCookie('skillswap_token');
      return res.json({ user: null });
    }

    res.json({ user });
  } catch {
    res.json({ user: null });
  }
});

// Logout
authRouter.post('/api/auth/logout', (req, res) => {
  res.clearCookie('skillswap_token');
  res.json({ message: 'Logged out successfully' });
});

module.exports = authRouter;
