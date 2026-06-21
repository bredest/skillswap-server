'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchApi, useAuth } from '@/lib/auth-context';
import { DollarSign } from 'lucide-react';

export default function EarningsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    const fetchEarnings = async () => {
      if (!user) return;
      try {
        const data = await fetchApi(`/payments/freelancer/${user.email}`);
        const completed = (data.payments || []).filter((p) => p.payment_status === 'completed');
        setPayments(completed);
        setTotalEarnings(completed.reduce((sum, p) => sum + p.amount, 0));
      } catch (err) {
        console.error('Error fetching earnings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, [user]);

  return (
    <DashboardLayout>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">My Earnings</h1>

      <div className="card p-6 sm:p-8 mb-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign size={24} />
          <span className="text-green-100">Total Earnings</span>
        </div>
        <p className="text-3xl sm:text-4xl font-extrabold">${totalEarnings.toFixed(2)}</p>
        <p className="text-green-100 text-sm mt-1">{payments.length} completed payments</p>
      </div>

      {loading ? (
        <div className="card p-4 animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
        </div>
      ) : payments.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Task Title</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Client</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Amount</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Completion Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{payment.task_id?.title || 'Task'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{payment.client_email?.split('@')[0]}</td>
                    <td className="px-4 py-3 font-semibold text-green-600 dark:text-green-400">${payment.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{new Date(payment.paid_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <DollarSign size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No earnings yet</h3>
          <p className="text-gray-500 dark:text-gray-400">Complete tasks to start earning</p>
        </div>
      )}
    </DashboardLayout>
  );
}
