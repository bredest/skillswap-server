const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const Task = require('../models/Task');
const Proposal = require('../models/Proposal');
const Payment = require('../models/Payment');
const { protect, authorize } = require('../middleware/auth');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST create checkout session
router.post('/api/payments/create-checkout', protect, authorize('client'), async (req, res) => {
  try {
    const { proposalId } = req.body;

    if (!proposalId) {
      return res.status(400).json({ message: 'Proposal ID is required' });
    }

    const proposal = await Proposal.findById(proposalId).populate('task_id');
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    const task = proposal.task_id;
    if (task.client_email !== req.user.email) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (proposal.status !== 'accepted') {
      return res.status(400).json({ message: 'Proposal must be accepted before payment' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: task.title,
              description: `Payment for task: ${task.title}`,
            },
            unit_amount: Math.round(proposal.proposed_budget * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard/client`,
      metadata: {
        proposalId: proposal._id.toString(),
        taskId: task._id.toString(),
        clientEmail: req.user.email,
        freelancerEmail: proposal.freelancer_email,
        amount: proposal.proposed_budget,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ message: 'Error creating checkout session', error: error.message });
  }
});

// POST confirm payment session
router.post('/api/payments/confirm-session', protect, async (req, res) => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    const { proposalId, taskId, clientEmail, freelancerEmail, amount } = session.metadata;

    const existingPayment = await Payment.findOne({ transaction_id: session.id });
    if (existingPayment) {
      return res.json({
        payment: existingPayment,
        message: 'Payment already recorded',
      });
    }

    const payment = await Payment.create({
      client_email: clientEmail,
      freelancer_email: freelancerEmail,
      task_id: taskId,
      amount: parseFloat(amount),
      transaction_id: session.id,
      payment_status: 'completed',
      paid_at: new Date(),
    });

    res.json({ payment, message: 'Payment confirmed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error confirming payment', error: error.message });
  }
});

// GET payments by client email
router.get('/api/payments/client/:email', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ client_email: req.params.email })
      .populate('task_id')
      .sort({ paid_at: -1 });
    res.json({ payments });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
});

// GET payments by freelancer email
router.get('/api/payments/freelancer/:email', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ freelancer_email: req.params.email })
      .populate('task_id')
      .sort({ paid_at: -1 });
    res.json({ payments });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
});

// GET all payments (Admin only)
router.get('/api/payments/all', protect, authorize('admin'), async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate('task_id')
      .sort({ paid_at: -1 });
    res.json({ payments });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
});

// POST Stripe webhook
router.post('/api/payments/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      const { proposalId, taskId, clientEmail, freelancerEmail, amount } = session.metadata;

      await Payment.create({
        client_email: clientEmail,
        freelancer_email: freelancerEmail,
        task_id: taskId,
        amount: parseFloat(amount),
        transaction_id: session.id,
        payment_status: 'completed',
        paid_at: new Date(),
      });
    }

    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ message: `Webhook Error: ${error.message}` });
  }
});

module.exports = router;
