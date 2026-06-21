'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fetchApi } from '@/lib/auth-context';
import { Star, Briefcase, Search } from 'lucide-react';

export default function FreelancersPage() {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        const data = await fetchApi('/users/freelancers');
        setFreelancers(data.freelancers || []);
        setFiltered(data.freelancers || []);
      } catch (err) {
        console.error('Error fetching freelancers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFreelancers();
  }, []);

  useEffect(() => {
    if (search) {
      setFiltered(
        freelancers.filter(
          (f) =>
            f.name.toLowerCase().includes(search.toLowerCase()) ||
            (f.skills && f.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())))
        )
      );
    } else {
      setFiltered(freelancers);
    }
  }, [search, freelancers]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Browse Freelancers</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Find skilled professionals for your tasks</p>
      </div>

      <div className="card p-4 mb-8">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
            placeholder="Search by name or skill..."
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((freelancer, idx) => (
            <motion.div
              key={freelancer._id || freelancer.email}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
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
                    </div>
                  </div>
                </div>
                {freelancer.skills && freelancer.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {freelancer.skills.slice(0, 5).map((skill, i) => (
                      <span key={i} className="badge bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">{skill}</span>
                    ))}
                  </div>
                )}
                {freelancer.bio && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{freelancer.bio}</p>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Briefcase size={14} />
                  {freelancer.completedJobs || 0} completed jobs
                  {freelancer.hourlyRate > 0 && (
                    <span className="ml-auto font-medium text-gray-900 dark:text-white">${freelancer.hourlyRate}/hr</span>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Search size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No freelancers found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {search ? 'Try a different search term' : 'No freelancers have signed up yet'}
          </p>
        </div>
      )}
    </div>
  );
}
