import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

interface Team {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export const Teams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    organization_id: '',
  });
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrganizations();
    fetchTeams();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await apiClient.get<{ success: boolean; data: any[] }>('/organizations');
      setOrganizations(response.data || []);
    } catch (err) {
      console.error('Error fetching organizations:', err);
    }
  };

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ success: boolean; data: Team[] }>('/teams');
      setTeams(response.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Team name is required');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post<{ data: Team }>('/teams', formData);
      setTeams([...teams, response.data]);
      setFormData({ name: '', description: '', organization_id: '' });
      setShowForm(false);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
            <p className="mt-2 text-gray-600">Manage your project teams</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {showForm ? 'Cancel' : '+ Create Team'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {showForm && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Team</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization *
                </label>
                <select
                  value={formData.organization_id}
                  onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select an organization</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Frontend Team"
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
                  placeholder="Describe your team"
                  rows={3}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Team'}
              </button>
            </form>
          </div>
        )}

        <div>
          {loading && !showForm ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading teams...</p>
            </div>
          ) : teams.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 text-lg">No teams yet.</p>
              <p className="text-gray-400">Create an organization first, then add teams!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{team.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{team.description || 'No description'}</p>
                  <div className="text-xs text-gray-400">
                    Created: {new Date(team.created_at).toLocaleDateString()}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition">
                      Members
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
