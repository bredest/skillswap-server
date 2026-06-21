const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  task_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: [true, 'Task ID is required'],
  },
  freelancer_email: {
    type: String,
    required: [true, 'Freelancer email is required'],
  },
  proposed_budget: {
    type: Number,
    required: [true, 'Proposed budget is required'],
    min: [1, 'Budget must be at least $1'],
  },
  estimated_days: {
    type: Number,
    required: [true, 'Estimated days is required'],
    min: [1, 'Must be at least 1 day'],
  },
  cover_note: {
    type: String,
    required: [true, 'Cover note is required'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  submitted_at: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

proposalSchema.index({ task_id: 1, freelancer_email: 1 }, { unique: true });

module.exports = mongoose.model('Proposal', proposalSchema);
