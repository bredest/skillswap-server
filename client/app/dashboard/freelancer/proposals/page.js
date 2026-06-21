'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchApi, useAuth } from '@/lib/auth-context';
import { Send } from 'lucide-react';

export default function MyProposalsPage() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      if (!user) return;
      try {
        const data = await fetchApi(`/proposals/freelancer/${user.email}`);
        setProposals(data.proposals || []);
      } catch (err) {
        console.error('Error fetching proposals:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, [user]);

  return (
    <DashboardLayout>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">My Proposals</h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
            </div>
          ))}
        </div>
      ) : proposals.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Task Title</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Budget Bid</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Date Sent</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {proposals.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{p.task_id?.title || 'Task'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">${p.proposed_budget}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{new Date(p.submitted_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-sm px-3 py-1 ${p.status === 'pending' ? 'badge-pending' : p.status === 'accepted' ? 'badge-accepted' : 'badge-rejected'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <Send size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No proposals sent</h3>
          <p className="text-gray-500 dark:text-gray-400">Browse tasks and submit your first proposal</p>
        </div>
      )}
    </DashboardLayout>
  );
}
