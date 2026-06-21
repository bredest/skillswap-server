'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fetchApi, useAuth } from '@/lib/auth-context';
import { ArrowRight, Search, Star, Clock, DollarSign, Users, Briefcase, CheckCircle } from 'lucide-react';

const categories = ['Design', 'Writing', 'Development', 'Marketing', 'Other'];

export default function Home() {
  const { user } = useAuth();
  const [latestTasks, setLatestTasks] = useState([]);
  const [topFreelancers, setTopFreelancers] = useState([]);
  const [stats, setStats] = useState({ totalTasks: 0, totalUsers: 0, totalPayout: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, freelancersRes, usersRes] = await Promise.all([
          fetchApi('/tasks/latest'),
          fetchApi('/users/freelancers/top'),
          fetchApi('/users/stats'),
        ]);

        setLatestTasks(tasksRes.tasks || []);
        setTopFreelancers(freelancersRes.freelancers || []);
        setStats({
          totalTasks: tasksRes.tasks?.length || 0,
          totalUsers: usersRes.totalUsers || 0,
          totalPayout: 0,
        });
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const dashboardPath = user?.role === 'client' ? '/dashboard/client' : user?.role === 'freelancer' ? '/dashboard/freelancer' : '/dashboard/admin';

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-20 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(14,165,233,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(217,70,239,0.1),transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Get your tasks done by{' '}
              <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                skilled freelancers
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400">
              Post a small task, receive proposals from talented freelancers, hire the best match, and get your work done — all in one place.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={user ? dashboardPath : '/login'} className="btn-primary text-lg px-8 py-4">
                Post a Task <ArrowRight size={20} className="ml-2" />
              </Link>
              <Link href="/tasks" className="btn-outline text-lg px-8 py-4">
                Browse Tasks
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Latest Tasks Section */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Latest Tasks</h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Fresh opportunities waiting for skilled freelancers</p>
              </div>
              <Link href="/tasks" className="text-primary-600 dark:text-primary-400 font-medium hover:underline flex items-center gap-1">
                View all <ArrowRight size={16} />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="card p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : latestTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {latestTasks.map((task, idx) => (
                  <motion.div
                    key={task._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                  >
                    <Link href={`/tasks/${task._id}`} className="card p-6 block h-full">
                      <div className="flex items-start justify-between mb-3">
                        <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                          {task.category}
                        </span>
                        <span className="badge-open">{task.status}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{task.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Posted by {task.client_email?.split('@')[0]}
                      </p>
                      <div className="flex items-center justify-between text-sm">
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
            ) : (
              <div className="text-center py-12">
                <Search size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No tasks posted yet. Be the first!</p>
                <Link href={user ? dashboardPath : '/login'} className="btn-primary mt-4">
                  Post a Task
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Top Freelancers Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Top Freelancers</h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Skilled professionals ready to help</p>
              </div>
              <Link href="/freelancers" className="text-primary-600 dark:text-primary-400 font-medium hover:underline flex items-center gap-1">
                View all <ArrowRight size={16} />
              </Link>
            </div>

            {topFreelancers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topFreelancers.map((freelancer, idx) => (
                  <motion.div
                    key={freelancer._id || freelancer.email}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                  >
                    <Link href={`/freelancers/${encodeURIComponent(freelancer.email)}`} className="card p-6 block h-full">
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={freelancer.image || 'https://ui-avatars.com/api/?name=User'}
                          alt={freelancer.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-primary-200 dark:border-primary-800"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{freelancer.name}</h3>
                          <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">{freelancer.avgRating || 'N/A'}</span>
                            <span className="text-sm text-gray-400">({freelancer.completedJobs || 0} jobs)</span>
                          </div>
                        </div>
                      </div>
                      {freelancer.skills && freelancer.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {freelancer.skills.slice(0, 4).map((skill, i) => (
                            <span key={i} className="badge bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">{skill}</span>
                          ))}
                          {freelancer.skills.length > 4 && (
                            <span className="badge bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500">+{freelancer.skills.length - 4}</span>
                          )}
                        </div>
                      )}
                      {freelancer.bio && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{freelancer.bio}</p>
                      )}
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No freelancers yet. Sign up to get started!</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">How It Works</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Get started in 3 easy steps</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Briefcase size={32} />,
                title: 'Post a Task',
                desc: 'Describe what you need, set your budget and deadline.',
              },
              {
                icon: <Search size={32} />,
                title: 'Get Proposals',
                desc: 'Freelancers review your task and send their best offers.',
              },
              {
                icon: <CheckCircle size={32} />,
                title: 'Hire & Pay',
                desc: 'Choose the best freelancer, pay securely, and get your work done.',
              },
            ].map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white">
                  {step.icon}
                </div>
                <div className="text-sm font-bold text-primary-600 dark:text-primary-400 mb-1">STEP {idx + 1}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-gray-500 dark:text-gray-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Popular Categories</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Find the right talent for your needs</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Link href={`/tasks?category=${cat}`} className="card p-6 block text-center hover:border-primary-300 dark:hover:border-primary-700 transition-all">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{cat}</h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl sm:text-5xl font-extrabold">{stats.totalTasks}</div>
              <div className="mt-2 text-primary-100">Tasks Posted</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-4xl sm:text-5xl font-extrabold">{stats.totalUsers}</div>
              <div className="mt-2 text-primary-100">Active Users</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-4xl sm:text-5xl font-extrabold">${stats.totalPayout}</div>
              <div className="mt-2 text-primary-100">Total Paid Out</div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
