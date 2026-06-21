const express = require('express');
const router = express.Router();
const Proposal = require('../models/Proposal');
const Task = require('../models/Task');
const { protect, authorize } = require('../middleware/auth');

// GET all proposals for a specific task
router.get('/api/proposals/task/:taskId', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.client_email !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const proposals = await Proposal.find({ task_id: req.params.taskId }).sort({ submitted_at: -1 });
    res.json({ proposals });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching proposals', error: error.message });
  }
});

// GET proposals by freelancer email (Challenge: filtered proposals)
router.get('/api/proposals/freelancer/:email', async (req, res) => {
  try {
    const proposals = await Proposal.find({ freelancer_email: req.params.email })
      .populate('task_id')
      .sort({ submitted_at: -1 });
    res.json({ proposals });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching proposals', error: error.message });
  }
});

// GET single proposal
router.get('/api/proposals/:id', protect, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id).populate('task_id');
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }
    res.json({ proposal });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching proposal', error: error.message });
  }
});

// POST submit proposal (Freelancer only)
router.post('/api/proposals', protect, authorize('freelancer'), async (req, res) => {
  try {
    const { task_id, proposed_budget, estimated_days, cover_note } = req.body;

    if (!task_id || !proposed_budget || !estimated_days || !cover_note) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const task = await Task.findById(task_id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.status !== 'open') {
      return res.status(400).json({ message: 'Task is no longer accepting proposals' });
    }

    const existing = await Proposal.findOne({ task_id, freelancer_email: req.user.email });
    if (existing) {
      return res.status(400).json({ message: 'You have already applied to this task' });
    }

    const proposal = await Proposal.create({
      task_id,
      freelancer_email: req.user.email,
      proposed_budget: parseFloat(proposed_budget),
      estimated_days: parseInt(estimated_days),
      cover_note,
    });

    res.status(201).json({ proposal, message: 'Proposal submitted successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already applied to this task' });
    }
    res.status(500).json({ message: 'Error submitting proposal', error: error.message });
  }
});

// PUT accept proposal (Client only)
router.put('/api/proposals/:id/accept', protect, authorize('client'), async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id).populate('task_id');
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    const task = await Task.findById(proposal.task_id._id);
    if (task.client_email !== req.user.email) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (task.status !== 'open') {
      return res.status(400).json({ message: 'Task is no longer open' });
    }

    const alreadyAccepted = await Proposal.findOne({
      task_id: proposal.task_id._id,
      status: 'accepted',
    });
    if (alreadyAccepted) {
      return res.status(400).json({ message: 'A proposal has already been accepted for this task' });
    }

    proposal.status = 'accepted';
    await proposal.save();

    await Proposal.updateMany(
      { task_id: proposal.task_id._id, _id: { $ne: proposal._id } },
      { status: 'rejected' }
    );

    task.status = 'in_progress';
    await task.save();

    res.json({ proposal, message: 'Proposal accepted. Proceed to payment.' });
  } catch (error) {
    res.status(500).json({ message: 'Error accepting proposal', error: error.message });
  }
});

// PUT reject proposal (Client only)
router.put('/api/proposals/:id/reject', protect, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id).populate('task_id');
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    const task = await Task.findById(proposal.task_id._id);
    if (task.client_email !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (proposal.status !== 'pending') {
      return res.status(400).json({ message: 'Proposal is not pending' });
    }

    proposal.status = 'rejected';
    await proposal.save();

    res.json({ proposal, message: 'Proposal rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting proposal', error: error.message });
  }
});

module.exports = router;
