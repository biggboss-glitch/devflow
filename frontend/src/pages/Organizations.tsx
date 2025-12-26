import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api/client';

interface Organization {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface OrgModalData {
  isOpen: boolean;
  type: 'view' | 'edit';
  org: Organization | null;
}

export const Organizations: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orgModal, setOrgModal] = useState<OrgModalData>({ isOpen: false, type: 'view', org: null });

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrganizations();
    }
  }, [isAuthenticated]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get<{ success: boolean; data: Organization[] }>('/organizations');
      if (response.success) {
        setOrganizations(response.data || []);
      } else {
        setError('Failed to fetch organizations');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to fetch organizations';
      setError(errorMessage);
      console.error('Error fetching organizations:', err);
      
      // If unauthorized, the interceptor should handle redirect
      if (err.response?.status === 401) {
        // Token might be invalid, let the interceptor handle it
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
      setError('Organization name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await apiClient.post<{ success: boolean; data: Organization }>('/organizations', formData);
      
      if (response.success && response.data) {
        setOrganizations([...organizations, response.data]);
        setFormData({ name: '', description: '' });
        setShowForm(false);
        setError('');
      } else {
        setError('Failed to create organization');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to create organization';
      setError(errorMessage);
      console.error('Error creating organization:', err);
      
      // If unauthorized, let the interceptor handle redirect
      if (err.response?.status === 401) {
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrg = (org: Organization) => {
    setOrgModal({ isOpen: true, type: 'view', org });
  };

  const handleEditOrg = (org: Organization) => {
    setFormData({ name: org.name, description: org.description });
    setOrgModal({ isOpen: true, type: 'edit', org });
  };

  const handleSaveEdit = async () => {
    if (!orgModal.org || !formData.name.trim()) {
      setError('Organization name is required');
      return;
    }

    try {
      setLoading(true);
      await apiClient.patch(`/organizations/${orgModal.org.id}`, formData);
      setOrganizations(organizations.map(o => o.id === orgModal.org!.id ? { ...o, ...formData } : o));
      setOrgModal({ isOpen: false, type: 'view', org: null });
      setFormData({ name: '', description: '' });
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update organization');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrg = async (org: Organization) => {
    if (!window.confirm(`Are you sure you want to delete organization "${org.name}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await apiClient.delete(`/organizations/${org.id}`);
      setOrganizations(organizations.filter(o => o.id !== org.id));
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete organization');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setOrgModal({ isOpen: false, type: 'view', org: null });
    setFormData({ name: '', description: '' });
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
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowForm(!showForm);
              setError('');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            disabled={loading}
          >
            {showForm ? 'Cancel' : '+ Create Organization'}
          </button>
        </div>

        {/* Error Message */}
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
                  <div className="text-xs text-gray-400 mb-4">
                    Created: {new Date(org.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewOrg(org)}
                      className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEditOrg(org)}
                      className="flex-1 px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteOrg(org)}
                      className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Organization Modal */}
      {orgModal.isOpen && orgModal.org && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {orgModal.type === 'edit' ? 'Edit Organization' : 'Organization Details'}
            </h2>

            {orgModal.type === 'edit' ? (
              <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{orgModal.org.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="font-medium">{orgModal.org.description || 'No description'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-medium">{new Date(orgModal.org.created_at).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-4"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
