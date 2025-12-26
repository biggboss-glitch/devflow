import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigned_to: string | null;
  due_date: string;
  created_at: string;
}

interface TaskModalData {
  isOpen: boolean;
  task: Task | null;
}

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [taskModal, setTaskModal] = useState<TaskModalData>({ isOpen: false, task: null });
  const [sprints, setSprints] = useState<any[]>([]);
  const [selectedSprint, setSelectedSprint] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    due_date: '',
    sprint_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSprints();
  }, []);

  useEffect(() => {
    if (selectedSprint) {
      fetchTasks(selectedSprint);
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

  const fetchTasks = async (sprintId: string) => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ success: boolean; data: Task[] }>('/tasks', { params: { sprint_id: sprintId } });
      setTasks(response.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post<{ data: Task }>('/tasks', {
        ...formData,
        sprint_id: selectedSprint,
      });
      setTasks([...tasks, response.data]);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        due_date: '',
        sprint_id: '',
      });
      setShowForm(false);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await apiClient.patch(`/tasks/${taskId}/status`, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'todo': return 'border-l-4 border-gray-400';
      case 'in_progress': return 'border-l-4 border-blue-400';
      case 'review': return 'border-l-4 border-purple-400';
      case 'done': return 'border-l-4 border-green-400';
      default: return 'border-l-4 border-gray-400';
    }
  };

  const kanbanColumns = [
    { key: 'todo', label: 'To Do', icon: '📋' },
    { key: 'in_progress', label: 'In Progress', icon: '🔄' },
    { key: 'review', label: 'Review', icon: '👀' },
    { key: 'done', label: 'Done', icon: '✅' },
  ];

  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    review: tasks.filter(t => t.status === 'review'),
    done: tasks.filter(t => t.status === 'done'),
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
            <p className="mt-2 text-gray-600">Manage your sprint tasks with Kanban board</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {showForm ? 'Cancel' : '+ Create Task'}
          </button>
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

        {/* Create Task Form */}
        {showForm && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Implement feature..."
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
                  placeholder="Describe the task..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Task'}
              </button>
            </form>
          </div>
        )}

        {/* Kanban Board */}
        {selectedSprint ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kanbanColumns.map((column) => (
              <div key={column.key} className="bg-gray-100 rounded-lg p-4 min-h-96">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>{column.icon}</span>
                  {column.label}
                  <span className="ml-auto text-sm font-normal text-gray-600">
                    {tasksByStatus[column.key as keyof typeof tasksByStatus]?.length || 0}
                  </span>
                </h3>

                <div className="space-y-3">
                  {tasksByStatus[column.key as keyof typeof tasksByStatus]?.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setTaskModal({ isOpen: true, task })}
                      className={`bg-white rounded-lg p-4 cursor-pointer hover:shadow-md transition ${getStatusColor(task.status)}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 flex-1">{task.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded font-semibold ${getPriorityColor(task.priority)}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{task.description || 'No description'}</p>
                      {task.due_date && (
                        <div className="text-xs text-gray-500">
                          📅 {new Date(task.due_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}

                  {tasksByStatus[column.key as keyof typeof tasksByStatus]?.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <p className="text-sm">No tasks</p>
                    </div>
                  )}
                </div>

                {/* Drag-to-update buttons */}
                {column.key !== 'done' && (
                  <button
                    onClick={() => {
                      // This would be for drag-drop in a real implementation
                    }}
                    className="w-full mt-4 p-2 text-sm text-gray-600 border-2 border-dashed border-gray-300 rounded hover:border-blue-400 transition"
                  >
                    Move →
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">No sprint selected</p>
            <p className="text-gray-400">Create a sprint first to start adding tasks!</p>
          </div>
        )}

        {/* Task Detail Modal */}
        {taskModal.isOpen && taskModal.task && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{taskModal.task.title}</h2>
                <button
                  onClick={() => setTaskModal({ isOpen: false, task: null })}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <p className="text-gray-600">{taskModal.task.description || 'No description'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <span className={`px-2 py-1 text-sm rounded font-semibold ${getPriorityColor(taskModal.task.priority)}`}>
                      {taskModal.task.priority}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                    <p className="text-gray-600">
                      {taskModal.task.due_date ? new Date(taskModal.task.due_date).toLocaleDateString() : 'No due date'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={taskModal.task.status}
                    onChange={(e) => {
                      handleUpdateTaskStatus(taskModal.task!.id, e.target.value);
                      setTaskModal({
                        isOpen: true,
                        task: { ...taskModal.task!, status: e.target.value }
                      });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => setTaskModal({ isOpen: false, task: null })}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    Close
                  </button>
                  <button
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
