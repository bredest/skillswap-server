'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchApi, useAuth } from '@/lib/auth-context';
import { Pencil, Trash2, ListTodo } from 'lucide-react';

export default function MyTasksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;
      try {
        const data = await fetchApi(`/tasks/client/${user.email}`);
        setTasks(data.tasks || []);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [user]);

  const handleDelete = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await fetchApi(`/tasks/${taskId}`, { method: 'DELETE' });
      setTasks(tasks.filter((t) => t._id !== taskId));
    } catch (err) {
      alert(err.message || 'Failed to delete task');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const data = await fetchApi(`/tasks/${editingTask._id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      setTasks(tasks.map((t) => (t._id === editingTask._id ? data.task : t)));
      setEditingTask(null);
      setEditForm({});
    } catch (err) {
      alert(err.message || 'Failed to update task');
    }
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <DashboardLayout>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">My Tasks</h1>

      <div className="flex gap-2 mb-6">
        {['all', 'open', 'in_progress', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div key={task._id} className="card p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{task.title}</h3>
                    <span className={`badge text-sm px-3 py-1 ${task.status === 'open' ? 'badge-open' : task.status === 'in_progress' ? 'badge-progress' : 'badge-completed'}`}>
                      {task.status === 'in_progress' ? 'In Progress' : task.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{task.category} · ${task.budget} · Due {new Date(task.deadline).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {task.status === 'open' && (
                    <button onClick={() => { setEditingTask(task); setEditForm({ title: task.title, category: task.category, description: task.description, budget: task.budget, deadline: new Date(task.deadline).toISOString().split('T')[0] }); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                      <Pencil size={16} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(task._id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {editingTask?._id === task._id && (
                <form onSubmit={handleEdit} className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="input-field" placeholder="Title" required />
                    <select value={editForm.category || ''} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="input-field" required>
                      <option value="">Category</option>
                      {['Design', 'Writing', 'Development', 'Marketing', 'Other'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <input type="number" value={editForm.budget || ''} onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })} className="input-field" placeholder="Budget" min="1" required />
                    <input type="date" value={editForm.deadline || ''} onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })} className="input-field" required />
                  </div>
                  <textarea value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="input-field mt-4" rows="3" required />
                  <div className="flex gap-2 mt-4">
                    <button type="submit" className="btn-primary text-sm">Save Changes</button>
                    <button type="button" onClick={() => setEditingTask(null)} className="btn-secondary text-sm">Cancel</button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <ListTodo size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No tasks found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't posted any tasks yet</p>
          <button onClick={() => router.push('/dashboard/client/post-task')} className="btn-primary">Post Your First Task</button>
        </div>
      )}
    </DashboardLayout>
  );
}
