'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fetchApi } from '@/lib/auth-context';
import { ArrowLeft, Star, Briefcase, DollarSign } from 'lucide-react';

export default function FreelancerProfilePage() {
  const params = useParams();
  const email = decodeURIComponent(params.email);
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await fetchApi(`/users/profile/${email}`);
        setUser(data.user);
        setReviews(data.reviews || []);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [email]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-8 animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Freelancer Not Found</h1>
        <Link href="/freelancers" className="btn-primary">Browse Freelancers</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/freelancers" className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6">
        <ArrowLeft size={16} /> Back to Freelancers
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="card p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <img
              src={user.image || 'https://ui-avatars.com/api/?name=User'}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-primary-200 dark:border-primary-800"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
                {user.isVerified && (
                  <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Verified</span>
                )}
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-3">{user.bio || 'No bio yet'}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5">
                  <Star size={16} className="text-yellow-400 fill-yellow-400" />
                  <span className="font-medium">{user.avgRating || 'N/A'}</span>
                  <span className="text-gray-400">({user.totalReviews || 0} reviews)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase size={16} />
                  {user.completedJobs || 0} jobs completed
                </span>
                {user.hourlyRate > 0 && (
                  <span className="flex items-center gap-1.5">
                    <DollarSign size={16} />
                    ${user.hourlyRate}/hr
                  </span>
                )}
              </div>
              {user.skills && user.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {user.skills.map((skill, i) => (
                    <span key={i} className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">{skill}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="card p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Reviews</h2>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review, idx) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{review.reviewer_email?.split('@')[0]}</span>
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} size={14} className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'} />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{review.comment}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No reviews yet</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
