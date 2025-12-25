import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

interface Sprint {
  id: string;
  name: string;
  status: string;
  start_date: string;
  end_date: string;
  goal: string;
  created_at: string;
}

export const Sprints: React.FC = () => {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    status: 'planned',
    start_date: '',
    end_date: '',
    project_id: '',
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
    fetchSprints();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await apiClient.get<{ success: boolean; data: any[] }>('/projects');
      setProjects(response.data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
    }
  };

  const fetchSprints = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ success: boolean; data: Sprint[] }>('/sprints');
      setSprints(response.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch sprints');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Sprint name is required');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post<{ data: Sprint }>('/sprints', formData);
      setSprints([...sprints, response.data]);
      setFormData({
        name: '',
        goal: '',
        status: 'planned',
        start_date: '',
        end_date: '',
        project_id: '',
      });
      setShowForm(false);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create sprint');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'planned': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sprints</h1>
            <p className="mt-2 text-gray-600">Plan and manage your sprints</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {showForm ? 'Cancel' : '+ Create Sprint'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {showForm && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Sprint</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project *
                </label>
                <select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sprint Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Sprint 1 - Feature A"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sprint Goal
                </label>
                <textarea
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What should this sprint accomplish?"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="planned">Planned</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Sprint'}
              </button>
            </form>
          </div>
        )}

        <div>
          {loading && !showForm ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading sprints...</p>
            </div>
          ) : sprints.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 text-lg">No sprints yet.</p>
              <p className="text-gray-400">Create a project first, then add sprints!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sprints.map((sprint) => {
                const daysLeft = getDaysRemaining(sprint.end_date);
                return (
                  <div
                    key={sprint.id}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{sprint.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{sprint.goal || 'No goal defined'}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full font-semibold ${getStatusColor(sprint.status)}`}>
                        {sprint.status.charAt(0).toUpperCase() + sprint.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                      <div>
                        📅 {new Date(sprint.start_date).toLocaleDateString()} → {new Date(sprint.end_date).toLocaleDateString()}
                      </div>
                      <div>
                        ⏳ {daysLeft > 0 ? `${daysLeft} days left` : 'Sprint ended'}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition">
                        View Tasks
                      </button>
                      <button className="px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition">
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
