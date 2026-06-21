'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchApi } from '@/lib/auth-context';
import { Trash2, Search } from 'lucide-react';

export default function ManageTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await fetchApi('/tasks', {
          method: 'GET',
        });
        setTasks(data.tasks || []);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleDelete = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task? This cannot be undone.')) return;
    try {
      await fetchApi(`/tasks/${taskId}`, { method: 'DELETE' });
      setTasks(tasks.filter((t) => t._id !== taskId));
    } catch (err) {
      alert(err.message || 'Failed to delete task');
    }
  };

  const filteredTasks = tasks.filter(
    (t) => t.title.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">Manage Tasks</h1>

      <div className="card p-4 mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search tasks..." />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Title</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Category</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Budget</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Client</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredTasks.map((task) => (
                  <tr key={task._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white max-w-xs truncate">{task.title}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{task.category}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">${task.budget}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-sm px-3 py-1 ${task.status === 'open' ? 'badge-open' : task.status === 'in_progress' ? 'badge-progress' : 'badge-completed'}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">{task.client_email?.split('@')[0]}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(task._id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
