'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchApi } from '@/lib/auth-context';
import { History } from 'lucide-react';

export default function TransactionsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await fetchApi('/payments/all');
        setPayments(data.payments || []);
      } catch (err) {
        console.error('Error fetching payments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">Transactions History</h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
            </div>
          ))}
        </div>
      ) : payments.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Client</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Freelancer</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Amount</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{payment.client_email?.split('@')[0]}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{payment.freelancer_email?.split('@')[0]}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">${payment.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{new Date(payment.paid_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-sm px-3 py-1 ${
                        payment.payment_status === 'completed' ? 'badge-accepted' :
                        payment.payment_status === 'pending' ? 'badge-pending' : 'badge-rejected'
                      }`}>
                        {payment.payment_status}
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
          <History size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No transactions yet</h3>
          <p className="text-gray-500 dark:text-gray-400">Payment history will appear here</p>
        </div>
      )}
    </DashboardLayout>
  );
}
