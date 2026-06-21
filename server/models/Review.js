const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  task_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: [true, 'Task ID is required'],
  },
  reviewer_email: {
    type: String,
    required: [true, 'Reviewer email is required'],
  },
  reviewee_email: {
    type: String,
    required: [true, 'Reviewee email is required'],
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters'],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

reviewSchema.index({ reviewee_email: 1 });
reviewSchema.index({ task_id: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
