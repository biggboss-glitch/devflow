import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

interface Notification {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  type?: string;
}

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<Notification[]>('/notifications');
      setNotifications(response || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`, {});
      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all', {});
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await apiClient.delete(`/notifications/${notificationId}`);
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const getNotificationIcon = (type?: string) => {
    switch(type) {
      case 'task_assigned': return '📋';
      case 'comment': return '💬';
      case 'status_changed': return '🔄';
      case 'team_update': return '👥';
      default: return '📢';
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="mt-2 text-gray-600">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Mark all as read
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        <div>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-3xl mb-2">✨</p>
              <p className="text-gray-500 text-lg">No notifications yet</p>
              <p className="text-gray-400">You'll see updates here when team members interact with your work</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-lg p-4 transition ${
                    notification.is_read
                      ? 'bg-white border border-gray-200'
                      : 'bg-blue-50 border border-blue-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl mt-1">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1">
                        <p className={`${notification.is_read ? 'text-gray-700' : 'font-semibold text-gray-900'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      {!notification.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                      >
                        Delete
                      </button>
                    </div>
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
