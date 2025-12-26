import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api/client';

interface DashboardStats {
  tasks: number;
  teams: number;
  projects: number;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({ tasks: 0, teams: 0, projects: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get<{ success: boolean; data: DashboardStats }>('/analytics/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="mt-2 text-gray-600">
              Role: <span className="font-semibold capitalize">{user?.role}</span>
            </p>
          </div>
          
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Tasks</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {loading ? '...' : stats.tasks}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Teams</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {loading ? '...' : stats.teams}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Projects</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {loading ? '...' : stats.projects}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <button
                onClick={() => navigate('/organizations')}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition cursor-pointer border-l-4 border-blue-500 text-left w-full"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🏢</span>
                  <div>
                    <p className="font-medium text-gray-900">Create Organization</p>
                    <p className="text-sm text-gray-500">Set up a new organization</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => navigate('/teams')}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition cursor-pointer border-l-4 border-green-500 text-left w-full"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">👥</span>
                  <div>
                    <p className="font-medium text-gray-900">Create Team</p>
                    <p className="text-sm text-gray-500">Add a new team</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => navigate('/projects')}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition cursor-pointer border-l-4 border-purple-500 text-left w-full"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📁</span>
                  <div>
                    <p className="font-medium text-gray-900">Create Project</p>
                    <p className="text-sm text-gray-500">Start a new project</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => navigate('/tasks')}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition cursor-pointer border-l-4 border-orange-500 text-left w-full"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">✓</span>
                  <div>
                    <p className="font-medium text-gray-900">Create Task</p>
                    <p className="text-sm text-gray-500">Add a new task</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

