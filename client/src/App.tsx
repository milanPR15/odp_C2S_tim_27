import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/protected_route/ProtectedRoute";

import LoginPage    from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import NotFoundPage from "./pages/not_found/NotFoundPage";

import UserDashboard from "./pages/user/UserDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersPage from "./pages/admin/UsersPage";
import CreateTournamentPage from "./pages/admin/CreateTournamentPage";
import CreateGamePage from "./pages/admin/CreateGamePage";
import GamesCatalogPage from "./pages/games/GamesCatalogPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* User routes */}
      <Route path="/dashboard" element={<ProtectedRoute requiredRole="user"><UserDashboard /></ProtectedRoute>} />
      <Route path="/games" element={<ProtectedRoute><GamesCatalogPage /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin"       element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><UsersPage /></ProtectedRoute>} />
      <Route path="/admin/tournaments/create" element={<ProtectedRoute requiredRole="admin"><CreateTournamentPage /></ProtectedRoute>} />
      <Route path="/admin/games/create" element={<ProtectedRoute requiredRole="admin"><CreateGamePage /></ProtectedRoute>} />

      <Route path="/"    element={<Navigate to="/login" replace />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*"    element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
