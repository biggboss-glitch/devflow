import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

interface Team {
  id: string;
  name: string;
  description: string;
  created_at: string;
  organization_id?: string;
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  name?: string;
  email?: string;
}

interface TeamModalData {
  isOpen: boolean;
  type: 'view' | 'edit' | 'members';
  team: Team | null;
  members?: Member[];
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
  const [teamModal, setTeamModal] = useState<TeamModalData>({ isOpen: false, type: 'view', team: null });

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
      const response = await apiClient.post<{ success: boolean; data: Team }>('/teams', formData);
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

  const handleEditTeam = (team: Team) => {
    setFormData({
      name: team.name,
      description: team.description,
      organization_id: team.organization_id || '',
    });
    setTeamModal({ isOpen: true, type: 'edit', team });
  };

  const handleSaveEdit = async () => {
    if (!teamModal.team || !formData.name.trim()) {
      setError('Team name is required');
      return;
    }

    try {
      setLoading(true);
      await apiClient.patch(`/teams/${teamModal.team.id}`, formData);
      setTeams(teams.map(t => t.id === teamModal.team!.id ? { ...t, ...formData } : t));
      setTeamModal({ isOpen: false, type: 'view', team: null });
      setFormData({ name: '', description: '', organization_id: '' });
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update team');
    } finally {
      setLoading(false);
    }
  };

  const handleViewMembers = async (team: Team) => {
    try {
      setLoading(true);
      // Assuming there's an endpoint to get team members
      const response = await apiClient.get<{ success: boolean; data: Member[] }>(`/teams/${team.id}/members`);
      setTeamModal({ isOpen: true, type: 'members', team, members: response.data || [] });
    } catch (err: any) {
      console.error('Error fetching team members:', err);
      // Fallback: show modal without members
      setTeamModal({ isOpen: true, type: 'members', team, members: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (team: Team) => {
    if (!window.confirm(`Are you sure you want to delete team "${team.name}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await apiClient.delete(`/teams/${team.id}`);
      setTeams(teams.filter(t => t.id !== team.id));
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete team');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setTeamModal({ isOpen: false, type: 'view', team: null });
    setFormData({ name: '', description: '', organization_id: '' });
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
                    <button
                      onClick={() => handleViewMembers(team)}
                      className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
                    >
                      Members
                    </button>
                    <button
                      onClick={() => handleEditTeam(team)}
                      className="flex-1 px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(team)}
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

      {/* Team Modal */}
      {teamModal.isOpen && teamModal.team && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {teamModal.type === 'edit' ? 'Edit Team' : teamModal.type === 'members' ? 'Team Members' : 'Team Details'}
            </h2>

            {teamModal.type === 'members' ? (
              <div className="space-y-4">
                {teamModal.members && teamModal.members.length > 0 ? (
                  <div className="space-y-2">
                    {teamModal.members.map((member) => (
                      <div key={member.id} className="p-3 bg-gray-50 rounded">
                        <p className="font-medium">{member.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-600">{member.email || member.user_id}</p>
                        <p className="text-xs text-gray-500 mt-1">Role: {member.role}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No members yet</p>
                )}
              </div>
            ) : teamModal.type === 'edit' ? (
              <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Team Name</label>
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
                  <p className="font-medium">{teamModal.team.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="font-medium">{teamModal.team.description || 'No description'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-medium">{new Date(teamModal.team.created_at).toLocaleDateString()}</p>
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
