'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchApi, useAuth } from '@/lib/auth-context';
import { FileCheck, Link as LinkIcon, Star } from 'lucide-react';

export default function ActiveProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [deliverableUrl, setDeliverableUrl] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;
      try {
        const proposalsData = await fetchApi(`/proposals/freelancer/${user.email}`);
        const acceptedProposals = (proposalsData.proposals || []).filter((p) => p.status === 'accepted' || p.status === 'pending');

        const projectData = [];
        for (const proposal of acceptedProposals) {
          if (proposal.task_id) {
            projectData.push({
              proposal,
              task: proposal.task_id,
            });
          }
        }

        const paymentsData = await fetchApi(`/payments/freelancer/${user.email}`);
        const payments = paymentsData.payments || [];
        for (const payment of payments) {
          if (payment.task_id && !projectData.find((p) => p.task._id === payment.task_id._id)) {
            projectData.push({ proposal: null, task: payment.task_id, payment });
          }
        }

        setProjects(projectData);
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [user]);

  const handleSubmitDeliverable = async () => {
    if (!deliverableUrl) return;
    try {
      await fetchApi(`/tasks/${selectedProject.task._id}`, {
        method: 'PUT',
        body: JSON.stringify({ deliverable_url: deliverableUrl }),
      });
      await fetchApi(`/tasks/${selectedProject.task._id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'completed' }),
      });
      setProjects(
        projects.map((p) =>
          p.task._id === selectedProject.task._id ? { ...p, task: { ...p.task, status: 'completed', deliverable_url: deliverableUrl } } : p
        )
      );
      setShowModal(false);
      setDeliverableUrl('');
    } catch (err) {
      alert(err.message || 'Failed to submit deliverable');
    }
  };

  const activeProjects = projects.filter((p) => p.task.status === 'in_progress');
  const completedProjects = projects.filter((p) => p.task.status === 'completed');

  return (
    <DashboardLayout>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">Active Projects</h1>

      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">In Progress</h2>
      {loading ? (
        <div className="space-y-4 mb-8">
          {[1, 2].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
            </div>
          ))}
        </div>
      ) : activeProjects.length > 0 ? (
        <div className="space-y-4 mb-8">
          {activeProjects.map((project) => (
            <div key={project.task._id} className="card p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{project.task.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{project.task.category} · ${project.task.budget} · Due {new Date(project.task.deadline).toLocaleDateString()}</p>
                  {project.proposal && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Your bid: ${project.proposal.proposed_budget}</p>
                  )}
                </div>
                <button onClick={() => { setSelectedProject(project); setShowModal(true); }} className="btn-primary text-sm">
                  <FileCheck size={14} className="mr-1.5" /> Submit Deliverable
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 mb-8">
          <p className="text-gray-500 dark:text-gray-400">No active projects</p>
        </div>
      )}

      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Completed</h2>
      {completedProjects.length > 0 ? (
        <div className="space-y-4">
          {completedProjects.map((project) => (
            <div key={project.task._id} className="card p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white">{project.task.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{project.task.category} · ${project.task.budget}</p>
              {project.task.deliverable_url && (
                <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400">
                  <LinkIcon size={14} />
                  <a href={project.task.deliverable_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {project.task.deliverable_url}
                  </a>
                </div>
              )}
              {project.payment && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  <Star size={14} className="inline mr-1" /> Paid: ${project.payment.amount}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No completed projects yet</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Submit Deliverable</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Enter the URL to your work (Google Docs, GitHub, etc.)</p>
            <input
              type="url"
              value={deliverableUrl}
              onChange={(e) => setDeliverableUrl(e.target.value)}
              className="input-field mb-4"
              placeholder="https://docs.google.com/..."
              required
            />
            <div className="flex gap-2">
              <button onClick={handleSubmitDeliverable} className="btn-primary flex-1">Submit</button>
              <button onClick={() => { setShowModal(false); setDeliverableUrl(''); }} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
