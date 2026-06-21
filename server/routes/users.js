const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// GET all users (Admin only)
router.get('/api/users/all', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// GET freelancers for browse page
router.get('/api/users/freelancers', async (req, res) => {
  try {
    const freelancers = await User.find({ role: 'freelancer', isBlocked: false })
      .select('name email image skills bio hourlyRate isVerified createdAt')
      .sort({ createdAt: -1 });

    res.json({ freelancers });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching freelancers', error: error.message });
  }
});

// GET top freelancers for home page
router.get('/api/users/freelancers/top', async (req, res) => {
  try {
    const Review = require('../models/Review');
    const Payment = require('../models/Payment');

    const freelancers = await User.find({ role: 'freelancer', isBlocked: false })
      .select('name email image skills bio hourlyRate isVerified')
      .limit(20);

    const freelancersWithStats = await Promise.all(
      freelancers.map(async (freelancer) => {
        const reviews = await Review.find({ reviewee_email: freelancer.email });
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;

        const completedJobs = await Payment.countDocuments({ freelancer_email: freelancer.email, payment_status: 'completed' });

        return {
          ...freelancer.toObject(),
          avgRating: parseFloat(avgRating.toFixed(1)),
          totalReviews: reviews.length,
          completedJobs,
        };
      })
    );

    freelancersWithStats.sort((a, b) => b.completedJobs - a.completedJobs || b.avgRating - a.avgRating);

    res.json({ freelancers: freelancersWithStats.slice(0, 6) });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching top freelancers', error: error.message });
  }
});

// GET user profile by email
router.get('/api/users/profile/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const Review = require('../models/Review');
    const Payment = require('../models/Payment');

    const reviews = await Review.find({ reviewee_email: user.email }).sort({ created_at: -1 });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    const completedJobs = await Payment.countDocuments({ freelancer_email: user.email, payment_status: 'completed' });

    res.json({
      user: { ...user.toObject(), avgRating: parseFloat(avgRating.toFixed(1)), totalReviews: reviews.length, completedJobs },
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// PUT update user profile
router.put('/api/users/profile', protect, async (req, res) => {
  try {
    const { name, image, skills, bio, hourlyRate } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (image) updates.image = image;
    if (skills) updates.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(Boolean);
    if (bio !== undefined) updates.bio = bio;
    if (hourlyRate !== undefined) updates.hourlyRate = parseFloat(hourlyRate);

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ user: updatedUser, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// PUT block/unblock user (Admin only)
router.put('/api/users/:id/block', protect, authorize('admin'), async (req, res) => {
  try {
    const { isBlocked } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: !!isBlocked }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user, message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// GET user stats
router.get('/api/users/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalClients = await User.countDocuments({ role: 'client' });
    const totalFreelancers = await User.countDocuments({ role: 'freelancer' });
    res.json({ totalUsers, totalClients, totalFreelancers });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

module.exports = router;
