'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fetchApi, useAuth } from '@/lib/auth-context';
import { DollarSign, Calendar, ArrowLeft, Send, CheckCircle } from 'lucide-react';

export default function TaskDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState({ proposed_budget: '', estimated_days: '', cover_note: '' });
  const [proposalLoading, setProposalLoading] = useState(false);
  const [proposalError, setProposalError] = useState('');
  const [proposalSuccess, setProposalSuccess] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const data = await fetchApi(`/tasks/${params.id}`);
        setTask(data.task);
      } catch (err) {
        console.error('Error fetching task:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [params.id]);

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    setProposalError('');
    setProposalSuccess(false);

    if (!user || user.role !== 'freelancer') {
      setProposalError('You must be logged in as a freelancer to submit a proposal');
      return;
    }

    if (!proposal.proposed_budget || !proposal.estimated_days || !proposal.cover_note) {
      setProposalError('All fields are required');
      return;
    }

    setProposalLoading(true);
    try {
      await fetchApi('/proposals', {
        method: 'POST',
        body: JSON.stringify({
          task_id: params.id,
          ...proposal,
        }),
      });
      setProposalSuccess(true);
      setProposal({ proposed_budget: '', estimated_days: '', cover_note: '' });
    } catch (err) {
      setProposalError(err.message || 'Failed to submit proposal');
    } finally {
      setProposalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-8 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Task Not Found</h1>
        <Link href="/tasks" className="btn-primary">Browse Tasks</Link>
      </div>
    );
  }

  const daysLeft = Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/tasks" className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6">
        <ArrowLeft size={16} /> Back to Tasks
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 mb-2 inline-block">
              {task.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{task.title}</h1>
          </div>
          <span className={`badge text-sm px-3 py-1 ${task.status === 'open' ? 'badge-open' : task.status === 'in_progress' ? 'badge-progress' : 'badge-completed'}`}>
            {task.status}
          </span>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-6 whitespace-pre-wrap">{task.description}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Budget</div>
            <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-white">
              <DollarSign size={16} className="text-green-500" />${task.budget}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Deadline</div>
            <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-white">
              <Calendar size={16} />{new Date(task.deadline).toLocaleDateString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Days Left</div>
            <div className={`font-semibold ${daysLeft <= 3 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
              {daysLeft > 0 ? `${daysLeft} days` : 'Expired'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Posted By</div>
            <div className="font-semibold text-gray-900 dark:text-white">{task.client_email?.split('@')[0]}</div>
          </div>
        </div>

        {task.status === 'open' && user?.role === 'freelancer' && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Submit a Proposal</h2>

            {proposalSuccess && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
                <CheckCircle size={16} /> Proposal submitted successfully!
              </div>
            )}

            {proposalError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {proposalError}
              </div>
            )}

            <form onSubmit={handleSubmitProposal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Your Budget (USD)</label>
                  <input
                    type="number"
                    value={proposal.proposed_budget}
                    onChange={(e) => setProposal({ ...proposal, proposed_budget: e.target.value })}
                    className="input-field"
                    placeholder="50"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="label">Estimated Days</label>
                  <input
                    type="number"
                    value={proposal.estimated_days}
                    onChange={(e) => setProposal({ ...proposal, estimated_days: e.target.value })}
                    className="input-field"
                    placeholder="3"
                    min="1"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label">Cover Note</label>
                <textarea
                  value={proposal.cover_note}
                  onChange={(e) => setProposal({ ...proposal, cover_note: e.target.value })}
                  className="input-field"
                  rows="4"
                  placeholder="Explain why you're the best fit for this task..."
                  required
                />
              </div>
              <button type="submit" disabled={proposalLoading} className="btn-primary">
                <Send size={16} className="mr-2" />
                {proposalLoading ? 'Submitting...' : 'Submit Proposal'}
              </button>
            </form>
          </div>
        )}

        {task.status !== 'open' && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <p className="text-gray-500 dark:text-gray-400">This task is no longer accepting proposals.</p>
          </div>
        )}

        {!user && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">Want to work on this task?</p>
            <Link href="/login" className="btn-primary">Sign in to submit a proposal</Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
