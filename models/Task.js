const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Design', 'Writing', 'Development', 'Marketing', 'Other'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  budget: {
    type: Number,
    required: [true, 'Budget is required'],
    min: [1, 'Budget must be at least $1'],
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required'],
  },
  client_email: {
    type: String,
    required: [true, 'Client email is required'],
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'completed'],
    default: 'open',
  },
  deliverable_url: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

taskSchema.index({ title: 'text', category: 1, status: 1 });

module.exports = mongoose.model('Task', taskSchema);
