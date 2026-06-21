const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  client_email: {
    type: String,
    required: [true, 'Client email is required'],
  },
  freelancer_email: {
    type: String,
    required: [true, 'Freelancer email is required'],
  },
  task_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: [true, 'Task ID is required'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be positive'],
  },
  transaction_id: {
    type: String,
    required: [true, 'Transaction ID is required'],
    unique: true,
  },
  payment_status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  paid_at: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Payment', paymentSchema);
