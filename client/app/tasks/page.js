'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { fetchApi } from '@/lib/auth-context';
import { Search, Clock, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';

const categories = ['All', 'Design', 'Writing', 'Development', 'Marketing', 'Other'];

function TasksContent() {
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, pages: 0 });

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (category !== 'All') params.set('category', category);
        params.set('page', page);
        params.set('limit', '9');
        params.set('status', 'open');

        const data = await fetchApi(`/tasks?${params.toString()}`);
        setTasks(data.tasks || []);
        setPagination(data.pagination || { page: 1, limit: 9, total: 0, pages: 0 });
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [search, category, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Browse Tasks</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Find open tasks and submit your proposal</p>
      </div>

      <div className="card p-4 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
              placeholder="Search tasks by title..."
            />
          </div>
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="input-field sm:w-48"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
            ))}
          </select>
          <button type="submit" className="btn-primary">Search</button>
        </form>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : tasks.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task, idx) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Link href={`/tasks/${task._id}`} className="card p-6 block h-full">
                  <div className="flex items-start justify-between mb-3">
                    <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                      {task.category}
                    </span>
                    <span className="badge-open">{task.status}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{task.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{task.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Posted by {task.client_email?.split('@')[0]}
                  </p>
                  <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-100 dark:border-gray-800">
                    <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 font-medium">
                      <DollarSign size={16} className="text-green-500" />${task.budget}
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <Clock size={16} />
                      {new Date(task.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="btn-secondary px-4 py-2 disabled:opacity-50"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    p === page
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.pages}
                className="btn-secondary px-4 py-2 disabled:opacity-50"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Showing {tasks.length} of {pagination.total} tasks (Page {pagination.page} of {pagination.pages})
          </p>
        </>
      ) : (
        <div className="text-center py-16">
          <Search size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No tasks found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {search || category !== 'All' ? 'Try adjusting your search or filters' : 'No open tasks available right now'}
          </p>
        </div>
      )}
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
            </div>
          ))}
        </div>
      </div>
    }>
      <TasksContent />
    </Suspense>
  );
}
