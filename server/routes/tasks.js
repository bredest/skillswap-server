const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect, authorize } = require('../middleware/auth');

// GET all tasks with search, category filter, and pagination (Challenge 1 & 3)
router.get('/api/tasks', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const status = req.query.status || 'open';

    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    const total = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
});

// GET latest open tasks for home page
router.get('/api/tasks/latest', async (req, res) => {
  try {
    const tasks = await Task.find({ status: 'open' })
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching latest tasks', error: error.message });
  }
});

// GET single task by ID
router.get('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ task });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task', error: error.message });
  }
});

// POST create task (Client only)
router.post('/api/tasks', protect, authorize('client', 'admin'), async (req, res) => {
  try {
    const { title, category, description, budget, deadline } = req.body;

    if (!title || !category || !description || !budget || !deadline) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const task = await Task.create({
      title,
      category,
      description,
      budget: parseFloat(budget),
      deadline: new Date(deadline),
      client_email: req.user.email,
    });

    res.status(201).json({ task, message: 'Task created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
});

// PUT update task (Client only, only when status is open)
router.put('/api/tasks/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.client_email !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this task' });
    }

    if (task.status !== 'open') {
      return res.status(400).json({ message: 'Can only edit tasks that are still open' });
    }

    const { title, category, description, budget, deadline } = req.body;
    const updates = {};
    if (title) updates.title = title;
    if (category) updates.category = category;
    if (description) updates.description = description;
    if (budget) updates.budget = parseFloat(budget);
    if (deadline) updates.deadline = new Date(deadline);

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ task: updatedTask, message: 'Task updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
});

// DELETE task (Client only, only if no proposals accepted)
router.delete('/api/tasks/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.client_email !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    const Proposal = require('../models/Proposal');
    const acceptedProposal = await Proposal.findOne({ task_id: req.params.id, status: 'accepted' });
    if (acceptedProposal) {
      return res.status(400).json({ message: 'Cannot delete task with accepted proposal' });
    }

    await Task.findByIdAndDelete(req.params.id);
    await Proposal.deleteMany({ task_id: req.params.id });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
});

// GET tasks by client email
router.get('/api/tasks/client/:email', async (req, res) => {
  try {
    const tasks = await Task.find({ client_email: req.params.email }).sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching client tasks', error: error.message });
  }
});

module.exports = router;
