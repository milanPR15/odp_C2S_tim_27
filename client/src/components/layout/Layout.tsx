import { type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuthHook";

const guestNav = [
  { to: "/", label: "Home" },
  { to: "/games", label: "Games" },
  { to: "/tournaments", label: "Tournaments" },
];

const userNav = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/games", label: "Games" },
  { to: "/tournaments", label: "Tournaments" },
  { to: "/teams", label: "My Teams" },
];

const adminNav = [
  { to: "/admin", label: "Admin" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/audit-logs", label: "Audit Logs" },
  { to: "/games", label: "Games" },
  { to: "/tournaments", label: "Tournaments" },
  { to: "/teams", label: "My Teams" },
];

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = user ? (user.role === "admin" ? adminNav : userNav) : guestNav;

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <header className="sticky top-0 z-30 border-b border-white/8 bg-[#080808]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/12 bg-white/8">
              <span className="text-white/60 text-sm">◈</span>
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">Pulse Grid</p>
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/28">
                {user ? user.role : "guest"}
              </p>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2 lg:justify-center">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `rounded-full border px-4 py-2 text-sm transition-colors ${
                    isActive
                      ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-100"
                      : "border-white/10 bg-white/3 text-white/55 hover:border-white/20 hover:bg-white/6 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/4 px-3 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/8 border border-white/10">
                    <span className="text-xs font-medium text-white/55">{user.username?.[0]?.toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-white/80">{user.username}</p>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/25">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => { logout(); navigate("/"); }}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/60 transition-colors hover:border-white/20 hover:bg-white/6 hover:text-white"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/65 transition-colors hover:border-white/20 hover:bg-white/6 hover:text-white"
                >
                  Log in
                </NavLink>
                <NavLink
                  to="/register"
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-white/90"
                >
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  );
}
