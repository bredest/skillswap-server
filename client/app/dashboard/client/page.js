'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchApi, useAuth } from '@/lib/auth-context';
import { ListTodo, Clock, CheckCircle, DollarSign, ArrowRight } from 'lucide-react';

export default function ClientDashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, totalSpent: 0 });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const [tasksData, paymentsData] = await Promise.all([
          fetchApi(`/tasks/client/${user.email}`),
          fetchApi(`/payments/client/${user.email}`),
        ]);

        const tasks = tasksData.tasks || [];
        setTasks(tasks);

        const totalSpent = (paymentsData.payments || []).reduce((sum, p) => sum + p.amount, 0);

        setStats({
          total: tasks.length,
          open: tasks.filter((t) => t.status === 'open').length,
          inProgress: tasks.filter((t) => t.status === 'in_progress').length,
          totalSpent,
        });
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
          { label: 'Total Tasks', value: stats.total, icon: ListTodo, color: 'text-blue-600' },
          { label: 'Open Tasks', value: stats.open, icon: Clock, color: 'text-yellow-600' },
          { label: 'In Progress', value: stats.inProgress, icon: CheckCircle, color: 'text-green-600' },
          { label: 'Total Spent', value: `$${stats.totalSpent.toFixed(2)}`, icon: DollarSign, color: 'text-primary-600' },
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
          <Link href="/dashboard/client/post-task" className="btn-primary">
            Post a Task <ArrowRight size={16} className="ml-2" />
          </Link>
          <Link href="/dashboard/client/my-tasks" className="btn-secondary">
            View My Tasks
          </Link>
        </div>
      </div>

      {!loading && tasks.length > 0 && (
        <div className="card p-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Tasks</h2>
            <Link href="/dashboard/client/my-tasks" className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task) => (
              <div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">${task.budget} · {task.category}</p>
                </div>
                <span className={`badge text-sm px-3 py-1 ${task.status === 'open' ? 'badge-open' : task.status === 'in_progress' ? 'badge-progress' : 'badge-completed'}`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
