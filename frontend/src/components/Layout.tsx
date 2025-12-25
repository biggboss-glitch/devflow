import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const navigationItems = [
    { label: 'Dashboard', path: '/', icon: '📊' },
    { label: 'Organizations', path: '/organizations', icon: '🏢' },
    { label: 'Teams', path: '/teams', icon: '👥' },
    { label: 'Projects', path: '/projects', icon: '📁' },
    { label: 'Sprints', path: '/sprints', icon: '🏃' },
    { label: 'Tasks', path: '/tasks', icon: '✓' },
    { label: 'Notifications', path: '/notifications', icon: '🔔' },
    { label: 'Analytics', path: '/analytics', icon: '📈' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold">DevFlow</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg"
          >
            ☰
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition text-left"
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="text-sm">
                <p className="font-medium">{user?.name}</p>
                <p className="text-gray-400 text-xs capitalize">{user?.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            {sidebarOpen ? 'Logout' : '⎋'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="px-6 py-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              {user?.name && `Welcome, ${user.name}`}
            </h2>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
