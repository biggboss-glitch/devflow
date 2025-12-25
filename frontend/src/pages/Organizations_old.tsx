import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

interface Organization {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export const Organizations: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ success: boolean; data: Organization[] }>('/organizations');
      setOrganizations(response.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch organizations');
      console.error('Error fetching organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Organization name is required');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post<{ success: boolean; data: Organization }>('/organizations', formData);
      
      setOrganizations([...organizations, response.data]);
      setFormData({ name: '', description: '' });
      setShowForm(false);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create organization');
      console.error('Error creating organization:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
            <p className="mt-2 text-gray-600">Manage your organizations and teams</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {showForm ? 'Cancel' : '+ Create Organization'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Organization</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Acme Corporation"
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
                  placeholder="What is your organization about?"
                  rows={4}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Organization'}
              </button>
            </form>
          </div>
        )}

        {/* Organizations List */}
        <div>
          {loading && !showForm ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading organizations...</p>
            </div>
          ) : organizations.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 text-lg">No organizations yet.</p>
              <p className="text-gray-400">Click "Create Organization" to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizations.map((org) => (
                <div
                  key={org.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{org.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{org.description || 'No description'}</p>
                  <div className="text-xs text-gray-400">
                    Created: {new Date(org.created_at).toLocaleDateString()}
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
