const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');

// POST create review
router.post('/api/reviews', protect, async (req, res) => {
  try {
    const { task_id, reviewee_email, rating, comment } = req.body;

    if (!task_id || !reviewee_email || !rating || !comment) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const existing = await Review.findOne({ task_id, reviewer_email: req.user.email });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this task' });
    }

    const review = await Review.create({
      task_id,
      reviewer_email: req.user.email,
      reviewee_email,
      rating: parseInt(rating),
      comment,
    });

    res.status(201).json({ review, message: 'Review submitted successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this task' });
    }
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
});

// GET reviews for a freelancer
router.get('/api/reviews/freelancer/:email', async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee_email: req.params.email }).sort({ created_at: -1 });

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    res.json({ reviews, averageRating, totalReviews: reviews.length });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});

// GET all reviews (Admin only)
router.get('/api/reviews/all', protect, async (req, res) => {
  try {
    const reviews = await Review.find({}).sort({ created_at: -1 });
    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});

module.exports = router;
