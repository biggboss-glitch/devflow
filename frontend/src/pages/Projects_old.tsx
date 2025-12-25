import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
}

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    team_id: '',
  });
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeams();
    fetchProjects();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await apiClient.get<{ success: boolean; data: any[] }>('/teams');
      setTeams(response.data || []);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError('Failed to load teams');
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ success: boolean; data: Project[] }>('/projects');
      setProjects(response.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post<{ data: Project }>('/projects', formData);
      setProjects([...projects, response.data]);
      setFormData({ name: '', description: '', status: 'active', team_id: '' });
      setShowForm(false);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="mt-2 text-gray-600">Manage your development projects</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {showForm ? 'Cancel' : '+ Create Project'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {showForm && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team *
                </label>
                <select
                  value={formData.team_id}
                  onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Mobile App v2.0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your project"
                  rows={3}
                />
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
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            </form>
          </div>
        )}

        <div>
          {loading && !showForm ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 text-lg">No projects yet.</p>
              <p className="text-gray-400">Create a team first, then add projects!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full font-semibold ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{project.description || 'No description'}</p>
                  <div className="text-xs text-gray-400">
                    Created: {new Date(project.created_at).toLocaleDateString()}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition">
                      View
                    </button>
                    <button className="flex-1 px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
