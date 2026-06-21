'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchApi, useAuth } from '@/lib/auth-context';
import { Send, Clock, CheckCircle, DollarSign, ArrowRight } from 'lucide-react';

export default function FreelancerDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, earnings: 0 });
  const [recentProposals, setRecentProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const [proposalsData, paymentsData] = await Promise.all([
          fetchApi(`/proposals/freelancer/${user.email}`),
          fetchApi(`/payments/freelancer/${user.email}`),
        ]);

        const proposals = proposalsData.proposals || [];
        const payments = paymentsData.payments || [];
        const earnings = payments.reduce((sum, p) => sum + p.amount, 0);

        setStats({
          total: proposals.length,
          pending: proposals.filter((p) => p.status === 'pending').length,
          accepted: proposals.filter((p) => p.status === 'accepted').length,
          earnings,
        });
        setRecentProposals(proposals.slice(0, 5));
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  return (
    <DashboardLayout>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Proposals', value: stats.total, icon: Send, color: 'text-blue-600' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-600' },
          { label: 'Accepted', value: stats.accepted, icon: CheckCircle, color: 'text-green-600' },
          { label: 'Earnings', value: `$${stats.earnings.toFixed(2)}`, icon: DollarSign, color: 'text-primary-600' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card p-4 sm:p-6">
              <div className={`w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3 ${stat.color}`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : stat.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/tasks" className="btn-primary">
            Browse Tasks <ArrowRight size={16} className="ml-2" />
          </Link>
          <Link href="/dashboard/freelancer/proposals" className="btn-secondary">View Proposals</Link>
        </div>
      </div>

      {!loading && recentProposals.length > 0 && (
        <div className="card p-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Proposals</h2>
            <Link href="/dashboard/freelancer/proposals" className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentProposals.map((p) => (
              <div key={p._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{p.task_id?.title || 'Task'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">${p.proposed_budget} · ${p.estimated_days} days</p>
                </div>
                <span className={`badge text-sm px-3 py-1 ${p.status === 'pending' ? 'badge-pending' : p.status === 'accepted' ? 'badge-accepted' : 'badge-rejected'}`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
