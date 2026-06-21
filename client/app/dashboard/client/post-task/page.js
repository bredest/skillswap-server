'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchApi } from '@/lib/auth-context';
import { Calendar, DollarSign, CheckCircle } from 'lucide-react';

const categories = ['Design', 'Writing', 'Development', 'Marketing', 'Other'];

export default function PostTaskPage() {
  const [form, setForm] = useState({ title: '', category: '', description: '', budget: '', deadline: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!form.title || !form.category || !form.description || !form.budget || !form.deadline) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    try {
      await fetchApi('/tasks', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setSuccess(true);
      setForm({ title: '', category: '', description: '', budget: '', deadline: '' });
    } catch (err) {
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">Post a Task</h1>

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 flex items-center gap-2">
          <CheckCircle size={20} /> Task posted successfully!
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="card p-6 sm:p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label" htmlFor="title">Task Title</label>
            <input
              id="title"
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field"
              placeholder="e.g. Design a logo for my startup"
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="category">Category</label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="description">Description</label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field"
              rows="4"
              placeholder="Describe what you need in detail..."
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="budget">Budget (USD)</label>
              <div className="relative">
                <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="budget"
                  type="number"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  className="input-field pl-10"
                  placeholder="50"
                  min="1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="deadline">Deadline</label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="deadline"
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="input-field pl-10"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Posting...' : 'Post Task'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
