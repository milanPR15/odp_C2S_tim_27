import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { Layout } from "../layout/Layout";
import { Spinner } from "../ui/UI";

function rolesMatch(currentRole?: string, requiredRole?: string): boolean {
  if (!requiredRole) return true;
  if (!currentRole) return false;

  const current = currentRole.toLowerCase();
  const required = requiredRole.toLowerCase();

  if (current === required) return true;

  if ((current === "player" && required === "user") || (current === "user" && required === "player")) {
    return true;
  }

  return false;
}

export const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, isLoading, logout } = useAuth();
  const location = useLocation();

  if (isLoading) return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center">
      <Spinner size={24} />
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  if (!rolesMatch(user?.role, requiredRole)) return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center">
      <div className="border border-red-500/20 bg-red-500/10 rounded-2xl p-10 text-center max-w-sm">
        <p className="text-red-400 text-sm mb-4">You don't have permission to access this page.</p>
        <button onClick={logout} className="text-xs text-white/40 hover:text-white/60 transition-colors underline">Sign out</button>
      </div>
    </div>
  );

  return <Layout>{children}</Layout>;
};
