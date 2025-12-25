import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

interface Analytics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  toDoTasks: number;
  tasksByPriority: {
    high: number;
    medium: number;
    low: number;
  };
  completionRate: number;
}

export const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [sprints, setSprints] = useState<any[]>([]);
  const [selectedSprint, setSelectedSprint] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSprints();
  }, []);

  useEffect(() => {
    if (selectedSprint) {
      fetchAnalytics(selectedSprint);
    }
  }, [selectedSprint]);

  const fetchSprints = async () => {
    try {
      const response = await apiClient.get<{ success: boolean; data: any[] }>('/sprints');
      setSprints(response.data || []);
      if (response.data?.length > 0) {
        setSelectedSprint(response.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching sprints:', err);
      setError('Failed to load sprints');
    }
  };

  const fetchAnalytics = async (sprintId: string) => {
    try {
      setLoading(true);
      // Fetch tasks for the sprint
      const tasksResponse = await apiClient.get<{ success: boolean; data: any[] }>('/tasks', { params: { sprint_id: sprintId } });

      const tasks = tasksResponse.data || [];

      // Calculate analytics
      const completed = tasks.filter((t: any) => t.status === 'done').length;
      const inProgress = tasks.filter((t: any) => t.status === 'in_progress').length;
      const toDo = tasks.filter((t: any) => t.status === 'todo').length;
      const review = tasks.filter((t: any) => t.status === 'review').length;

      const byPriority = {
        high: tasks.filter((t: any) => t.priority === 'high').length,
        medium: tasks.filter((t: any) => t.priority === 'medium').length,
        low: tasks.filter((t: any) => t.priority === 'low').length,
      };

      const completionRate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

      setAnalytics({
        totalTasks: tasks.length,
        completedTasks: completed,
        inProgressTasks: inProgress,
        toDoTasks: toDo,
        tasksByPriority: byPriority,
        completionRate,
      });
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-gray-600">Track sprint performance and team metrics</p>
        </div>

        {/* Sprint Selector */}
        <div className="mb-6 flex gap-4">
          <select
            value={selectedSprint}
            onChange={(e) => setSelectedSprint(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a sprint</option>
            {sprints.map((sprint) => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading analytics...</p>
          </div>
        ) : !analytics ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">No sprint selected</p>
            <p className="text-gray-400">Select a sprint to view analytics</p>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              {/* Total Tasks */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalTasks}</p>
                  </div>
                  <div className="text-4xl">📋</div>
                </div>
              </div>

              {/* Completed */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Completed</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{analytics.completedTasks}</p>
                  </div>
                  <div className="text-4xl">✅</div>
                </div>
              </div>

              {/* In Progress */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">In Progress</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{analytics.inProgressTasks}</p>
                  </div>
                  <div className="text-4xl">🔄</div>
                </div>
              </div>

              {/* To Do */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">To Do</p>
                    <p className="text-3xl font-bold text-gray-600 mt-2">{analytics.toDoTasks}</p>
                  </div>
                  <div className="text-4xl">📍</div>
                </div>
              </div>

              {/* Completion Rate */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">{analytics.completionRate}%</p>
                  </div>
                  <div className="text-4xl">📈</div>
                </div>
              </div>
            </div>

            {/* Task Status Progress Bar */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Sprint Progress</h2>
              <div className="flex gap-2 items-end h-32">
                {/* To Do */}
                <div className="flex-1 flex flex-col items-center">
                  <div
                    style={{
                      height: `${(analytics.toDoTasks / analytics.totalTasks) * 120 || 20}px`
                    }}
                    className="w-full bg-gray-300 rounded-t transition-all"
                  ></div>
                  <p className="text-xs font-semibold text-gray-600 mt-2">To Do</p>
                  <p className="text-sm font-bold text-gray-900">{analytics.toDoTasks}</p>
                </div>

                {/* In Progress */}
                <div className="flex-1 flex flex-col items-center">
                  <div
                    style={{
                      height: `${(analytics.inProgressTasks / analytics.totalTasks) * 120 || 20}px`
                    }}
                    className="w-full bg-blue-400 rounded-t transition-all"
                  ></div>
                  <p className="text-xs font-semibold text-gray-600 mt-2">In Progress</p>
                  <p className="text-sm font-bold text-gray-900">{analytics.inProgressTasks}</p>
                </div>

                {/* Review */}
                <div className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-purple-400 rounded-t transition-all"
                    style={{ height: '20px' }}
                  ></div>
                  <p className="text-xs font-semibold text-gray-600 mt-2">Review</p>
                  <p className="text-sm font-bold text-gray-900">0</p>
                </div>

                {/* Completed */}
                <div className="flex-1 flex flex-col items-center">
                  <div
                    style={{
                      height: `${(analytics.completedTasks / analytics.totalTasks) * 120 || 20}px`
                    }}
                    className="w-full bg-green-400 rounded-t transition-all"
                  ></div>
                  <p className="text-xs font-semibold text-gray-600 mt-2">Completed</p>
                  <p className="text-sm font-bold text-gray-900">{analytics.completedTasks}</p>
                </div>
              </div>
            </div>

            {/* Priority Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* High Priority */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">High Priority</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-red-600">{analytics.tasksByPriority.high}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {analytics.totalTasks > 0
                        ? Math.round((analytics.tasksByPriority.high / analytics.totalTasks) * 100)
                        : 0}% of total
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-2xl">
                    🔴
                  </div>
                </div>
              </div>

              {/* Medium Priority */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Medium Priority</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-yellow-600">{analytics.tasksByPriority.medium}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {analytics.totalTasks > 0
                        ? Math.round((analytics.tasksByPriority.medium / analytics.totalTasks) * 100)
                        : 0}% of total
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-2xl">
                    🟡
                  </div>
                </div>
              </div>

              {/* Low Priority */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Priority</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-green-600">{analytics.tasksByPriority.low}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {analytics.totalTasks > 0
                        ? Math.round((analytics.tasksByPriority.low / analytics.totalTasks) * 100)
                        : 0}% of total
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                    🟢
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
