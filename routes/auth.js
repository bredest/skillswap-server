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

// Google OAuth - redirect to Google
authRouter.get('/api/auth/google', (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.BETTER_AUTH_URL || 'http://localhost:5000')}/api/auth/google/callback` +
    `&response_type=code` +
    `&scope=openid%20email%20profile` +
    `&state=${encodeURIComponent(frontendUrl)}`;
  res.redirect(googleAuthUrl);
});

// Google OAuth callback
authRouter.get('/api/auth/google/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    const frontendUrl = decodeURIComponent(state || 'http://localhost:3000');

    if (!code) {
      return res.redirect(`${frontendUrl}/login?error=Google+auth+failed`);
    }

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.BETTER_AUTH_URL || 'http://localhost:5000'}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) {
      return res.redirect(`${frontendUrl}/login?error=Google+token+exchange+failed`);
    }

    // Get user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const googleUser = await userRes.json();

    if (!googleUser.email) {
      return res.redirect(`${frontendUrl}/login?error=Google+user+info+failed`);
    }

    // Find or create user
    let user = await User.findOne({ email: googleUser.email });

    if (user) {
      if (user.isBlocked) {
        return res.redirect(`${frontendUrl}/login?error=Account+blocked`);
      }
    } else {
      user = await User.create({
        name: googleUser.name || googleUser.email.split('@')[0],
        email: googleUser.email,
        image: googleUser.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(googleUser.name || 'User')}`,
        role: 'client',
        password: await bcrypt.hash(Math.random().toString(36).slice(-12), 10),
      });
    }

    // Create JWT session
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Redirect to frontend with token
    res.redirect(`${frontendUrl}/login?token=${token}&email=${encodeURIComponent(user.email)}`);
  } catch (error) {
    console.error('Google OAuth error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/login?error=Google+auth+error`);
  }
});

module.exports = authRouter;
