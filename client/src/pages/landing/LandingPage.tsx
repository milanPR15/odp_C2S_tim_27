import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { Layout } from "../../components/layout/Layout";

const highlights = [
  {
    title: "Track tournaments",
    text: "Browse active tournaments, registration status, and match schedules in one place.",
  },
  {
    title: "Manage teams",
    text: "Create teams, invite players, and keep your roster ready for the next bracket.",
  },
  {
    title: "Follow matches",
    text: "See results, fixtures, and tournament progress without digging through menus.",
  },
];

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    navigate(user.role === "admin" ? "/admin" : "/dashboard", { replace: true });
  }, [isAuthenticated, user, navigate]);

  return (
    <Layout>
      <main className="relative min-h-[calc(100vh-7rem)] overflow-hidden rounded-3xl border border-white/8 bg-[#080808] text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-24 w-96 h-96 rounded-full bg-cyan-500/12 blur-3xl" />
          <div className="absolute top-40 -left-24 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_40%),linear-gradient(to_bottom,rgba(255,255,255,0.03),transparent_28%)]" />
        </div>

        <div className="relative grid min-h-[calc(100vh-7rem)] items-center gap-12 px-6 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-16">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/45">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.55)]" />
              Live tournaments, teams, and match tracking
            </div>

            <h1 className="max-w-xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Everything your team needs to compete.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-white/55 sm:text-lg">
              Pulse Grid keeps tournaments, games, team rosters, and match results in one focused space so players and admins can move quickly.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                to="/games"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/4 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/20 hover:bg-white/6"
              >
                Browse Games
              </Link>
              <Link
                to="/tournaments"
                className="inline-flex items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-300/12 px-6 py-3 text-sm font-semibold text-cyan-100 transition-colors hover:bg-cyan-300/18"
              >
                Browse Tournaments
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5 hover:bg-white/90"
              >
                Log in
              </Link>
              <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/4 px-5 py-3 text-sm text-white/50">
                <span className="text-white/30">Public entry page</span>
                <span className="text-white/20">•</span>
                <span>Sign in to continue</span>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {highlights.map((item, index) => (
              <article
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/4 p-6 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1"
                style={{ transitionDelay: `${index * 60}ms` }}
              >
                <p className="text-xs uppercase tracking-[0.22em] text-white/30">0{index + 1}</p>
                <h2 className="mt-3 text-lg font-semibold text-white">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/45">{item.text}</p>
              </article>
            ))}

            <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/8 p-6 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/60">Start here</p>
              <p className="mt-3 text-sm leading-6 text-white/70">
                Use the header menu or the buttons above to explore public pages before signing in.
              </p>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}