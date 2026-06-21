'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchApi, useAuth } from '@/lib/auth-context';
import { CheckCircle, XCircle, DollarSign, Clock, MessageSquare } from 'lucide-react';

export default function ClientProposalsPage() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const tasksData = await fetchApi(`/tasks/client/${user.email}`);
        const allTasks = tasksData.tasks || [];

        const allProposals = [];
        for (const task of allTasks) {
          try {
            const data = await fetchApi(`/proposals/task/${task._id}`);
            const taskProposals = (data.proposals || []).map((p) => ({ ...p, taskTitle: task.title, taskCategory: task.category, taskBudget: task.budget }));
            allProposals.push(...taskProposals);
          } catch {}
        }
        setProposals(allProposals);
      } catch (err) {
        console.error('Error loading proposals:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleAccept = async (proposal) => {
    if (!confirm(`Accept this proposal for $${proposal.proposed_budget}? You will be redirected to payment.`)) return;

    setProcessing(true);
    try {
      await fetchApi(`/proposals/${proposal._id}/accept`, { method: 'PUT' });

      const checkoutData = await fetchApi('/payments/create-checkout', {
        method: 'POST',
        body: JSON.stringify({ proposalId: proposal._id }),
      });
      if (checkoutData.url) {
        window.location.href = checkoutData.url;
      }
    } catch (err) {
      alert(err.message || 'Failed to accept proposal');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (proposalId) => {
    if (!confirm('Reject this proposal?')) return;
    try {
      await fetchApi(`/proposals/${proposalId}/reject`, { method: 'PUT' });
      setProposals(proposals.map((p) => (p._id === proposalId ? { ...p, status: 'rejected' } : p)));
    } catch (err) {
      alert(err.message || 'Failed to reject proposal');
    }
  };

  const pendingProposals = proposals.filter((p) => p.status === 'pending');

  return (
    <DashboardLayout>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">Manage Proposals</h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : pendingProposals.length > 0 ? (
        <div className="space-y-4">
          {pendingProposals.map((proposal) => (
            <div key={proposal._id} className="card p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{proposal.taskTitle}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{proposal.taskCategory}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                      <DollarSign size={14} className="text-green-500" />
                      Proposed: ${proposal.proposed_budget}
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <Clock size={14} /> {proposal.estimated_days} days
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      By: {proposal.freelancer_email?.split('@')[0]}
                    </span>
                  </div>
                  {proposal.cover_note && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">{proposal.cover_note}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAccept(proposal)} disabled={processing} className="btn-primary text-sm px-4 py-2">
                    <CheckCircle size={14} className="mr-1.5" /> Accept
                  </button>
                  <button onClick={() => handleReject(proposal._id)} className="btn-secondary text-sm px-4 py-2">
                    <XCircle size={14} className="mr-1.5" /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <MessageSquare size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No pending proposals</h3>
          <p className="text-gray-500 dark:text-gray-400">Proposals from freelancers will appear here</p>
        </div>
      )}
    </DashboardLayout>
  );
}
