'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchApi } from '@/lib/auth-context';
import { Users, ListTodo, DollarSign, Clock } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ totalUsers: 0, totalTasks: 0, totalRevenue: 0, activeTasks: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, tasksData, paymentsData] = await Promise.all([
          fetchApi('/users/all'),
          fetchApi('/tasks?status=open&limit=100'),
          fetchApi('/payments/all'),
        ]);

        const tasks = tasksData.tasks || [];
        const payments = paymentsData.payments || [];
        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

        setStats({
          totalUsers: usersData.users?.length || 0,
          totalTasks: tasks.length,
          totalRevenue,
          activeTasks: tasks.filter((t) => t.status === 'in_progress').length,
        });
      } catch (err) {
        console.error('Error loading admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600' },
          { label: 'Total Tasks', value: stats.totalTasks, icon: ListTodo, color: 'text-green-600' },
          { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-primary-600' },
          { label: 'Active Tasks', value: stats.activeTasks, icon: Clock, color: 'text-yellow-600' },
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
    </DashboardLayout>
  );
}
