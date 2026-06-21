'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchApi, useAuth } from '@/lib/auth-context';
import { CheckCircle } from 'lucide-react';

export default function EditProfilePage() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ name: '', image: '', skills: '', bio: '', hourlyRate: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        image: user.image || '',
        skills: (user.skills || []).join(', '),
        bio: user.bio || '',
        hourlyRate: user.hourlyRate || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!form.name) {
      setError('Name is required');
      return;
    }

    setLoading(true);
    try {
      await fetchApi('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: form.name,
          image: form.image,
          skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
          bio: form.bio,
          hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : 0,
        }),
      });
      setSuccess(true);
      refreshUser();
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">Edit Profile</h1>

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 flex items-center gap-2">
          <CheckCircle size={20} /> Profile updated successfully!
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="card p-6 sm:p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
          </div>

          <div>
            <label className="label">Profile Photo URL</label>
            <input type="url" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input-field" placeholder="https://example.com/photo.jpg" />
          </div>

          <div>
            <label className="label">Skills (comma separated)</label>
            <input type="text" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} className="input-field" placeholder="React, Node.js, CSS" />
          </div>

          <div>
            <label className="label">Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="input-field" rows="4" placeholder="Tell clients about yourself..." />
          </div>

          <div>
            <label className="label">Hourly Rate (USD)</label>
            <input type="number" value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })} className="input-field" placeholder="25" min="0" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
