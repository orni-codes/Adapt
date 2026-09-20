import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050709] flex flex-col items-center justify-center gap-3 text-[#7E8B9B]">
        <Loader2 className="w-7 h-7 animate-spin text-[#00C7D4]" />
        <span className="text-xs font-mono">Authenticating session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to /login and remember the path the user attempted to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
