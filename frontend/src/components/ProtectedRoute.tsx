import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'team_lead' | 'developer';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Check role hierarchy
    const roleHierarchy: Record<string, number> = {
      developer: 1,
      team_lead: 2,
      admin: 3,
    };

    if (roleHierarchy[user?.role || ''] < roleHierarchy[requiredRole]) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

