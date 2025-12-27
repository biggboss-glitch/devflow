import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  const { isAuthenticated, user } = useAuth();
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

  // Check if user can create sprints (team_lead or admin)
  const canCreateSprint = user?.role === 'admin' || user?.role === 'team_lead';

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
      fetchSprints();
    }
  }, [isAuthenticated]);

  const fetchProjects = async () => {
    try {
      setError('');
      const response = await apiClient.get<{ success: boolean; data: any[] }>('/projects');
      if (response.success && Array.isArray(response.data)) {
        setProjects(response.data);
      } else {
        setProjects([]);
      }
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      const errorMessage = err.response?.data?.error?.message || 'Failed to load projects';
      setError(errorMessage);
      setProjects([]);
      
      // If unauthorized, let the interceptor handle redirect
      if (err.response?.status === 401) {
        return;
      }
    }
  };

  const fetchSprints = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get<{ success: boolean; data: Sprint[] }>('/sprints');
      if (response.success && Array.isArray(response.data)) {
        setSprints(response.data);
      } else {
        setSprints([]);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to fetch sprints';
      setError(errorMessage);
      console.error('Error fetching sprints:', err);
      setSprints([]);
      
      // If unauthorized, let the interceptor handle redirect
      if (err.response?.status === 401) {
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!formData.name.trim()) {
      setError('Sprint name is required');
      return;
    }

    if (!formData.project_id) {
      setError('Please select a project');
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      setError('Start date and end date are required');
      return;
    }

    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      setError('End date must be after start date');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await apiClient.post<{ success: boolean; data: Sprint }>('/sprints', {
        project_id: formData.project_id,
        name: formData.name,
        goal: formData.goal,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status,
      });
      
      if (response.success && response.data) {
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
        // Refresh sprints list
        fetchSprints();
      } else {
        setError('Failed to create sprint');
      }
    } catch (err: any) {
      let errorMessage = err.response?.data?.error?.message || 'Failed to create sprint';
      
      // Handle permission errors
      if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to create sprints. Only Team Leads and Admins can create sprints.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Please login to continue';
        // Let the interceptor handle redirect
        return;
      }
      
      setError(errorMessage);
      console.error('Error creating sprint:', err);
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
          {canCreateSprint ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (projects.length === 0) {
                  setError('Please create a project first before creating sprints');
                  return;
                }
                setShowForm(!showForm);
                setError('');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              disabled={projects.length === 0}
              title={projects.length === 0 ? 'Create a project first' : ''}
            >
              {showForm ? 'Cancel' : '+ Create Sprint'}
            </button>
          ) : (
            <div className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg cursor-not-allowed" title="Only Team Leads and Admins can create sprints">
              + Create Sprint (Restricted)
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
            {error.includes('token') || error.includes('Unauthorized') ? (
              <div className="mt-2 text-sm">
                Please <a href="/login" className="text-blue-600 underline">login</a> to continue.
              </div>
            ) : null}
          </div>
        )}

        {showForm && canCreateSprint && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Sprint</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project *
                </label>
                {projects.length === 0 ? (
                  <div className="w-full px-3 py-2 border border-yellow-300 bg-yellow-50 rounded-lg text-yellow-800 text-sm">
                    No projects available. Please create a project first.
                    <a href="/projects" className="ml-2 text-blue-600 underline">Go to Projects</a>
                  </div>
                ) : (
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
                )}
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
              <p className="text-gray-500 text-lg mb-2">No sprints yet.</p>
              {!canCreateSprint ? (
                <div>
                  <p className="text-gray-400 mb-2">Only Team Leads and Admins can create sprints.</p>
                  <p className="text-sm text-gray-500">Contact your administrator to be promoted to Team Lead.</p>
                </div>
              ) : projects.length === 0 ? (
                <div>
                  <p className="text-gray-400 mb-4">You need to create a project first before creating sprints.</p>
                  <a 
                    href="/projects" 
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Go to Projects
                  </a>
                </div>
              ) : (
                <div>
                  <p className="text-gray-400 mb-4">Click "Create Sprint" to get started!</p>
                  <p className="text-sm text-gray-500">Make sure to select a project when creating a sprint.</p>
                </div>
              )}
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