import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { watchlistApi } from "../../api_services/watchlist/WatchlistAPIService";
import { Empty, ErrorBox, PageHeader, Spinner, StatCard, StatusBadge } from "../../components/ui/UI";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { WatchlistTournamentDto } from "../../models/watchlist/WatchlistTypes";

export default function UserDashboard() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistTournamentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWatchlist = useCallback(async () => {
    setLoading(true);
    setError("");

    const res = await watchlistApi.getMine();
    if (!res.success) {
      setWatchlist([]);
      setError(res.message || "Failed to load followed tournaments.");
    } else {
      setWatchlist(res.data ?? []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadWatchlist();
  }, [loadWatchlist]);

  const upcomingCount = useMemo(() => watchlist.filter((item) => item.status === "upcoming").length, [watchlist]);
  const ongoingCount = useMemo(() => watchlist.filter((item) => item.status === "ongoing").length, [watchlist]);

  async function handleUnfollow(tournamentId: number) {
    const res = await watchlistApi.unfollow(tournamentId);
    if (!res.success) {
      setError(res.message || "Failed to update watchlist.");
      return;
    }

    await loadWatchlist();
  }

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Overview" title={`Welcome, ${user?.username}`} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Followed" value={watchlist.length} sub="Total tournaments on your watchlist" />
        <StatCard label="Upcoming" value={upcomingCount} sub="Open for future play" color="text-indigo-300" />
        <StatCard label="Ongoing" value={ongoingCount} sub="Active tournament tracks" color="text-cyan-300" />
      </div>

      {error && <ErrorBox message={error} />}

      {loading ? (
        <div className="rounded-2xl border border-white/8 bg-white/3 min-h-56 flex items-center justify-center">
          <Spinner size={22} />
        </div>
      ) : watchlist.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-white/3">
          <Empty message="You are not following any tournaments yet." />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {watchlist.map((item) => (
            <article key={item.id} className="rounded-2xl border border-white/8 bg-white/4 p-5 shadow-lg shadow-black/10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <img
                    src={item.game_logo}
                    alt={item.game_title}
                    className="h-14 w-14 rounded-2xl border border-white/10 object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-mono uppercase tracking-[0.22em] text-white/30">{item.game_title}</p>
                    <h2 className="mt-1 text-lg font-semibold text-white truncate">{item.name}</h2>
                    <p className="mt-2 text-sm text-white/45">Added {new Date(item.added_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <StatusBadge status={item.status} />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-white/65">
                <div className="rounded-xl border border-white/6 bg-white/3 p-3">
                  <p className="text-[11px] uppercase tracking-widest text-white/28">Format</p>
                  <p className="mt-1 capitalize">{item.format.replace("_", " ")}</p>
                </div>
                <div className="rounded-xl border border-white/6 bg-white/3 p-3">
                  <p className="text-[11px] uppercase tracking-widest text-white/28">Prize pool</p>
                  <p className="mt-1">€{item.prize_pool.toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-white/6 bg-white/3 p-3">
                  <p className="text-[11px] uppercase tracking-widest text-white/28">Teams</p>
                  <p className="mt-1">Up to {item.max_teams}</p>
                </div>
                <div className="rounded-xl border border-white/6 bg-white/3 p-3">
                  <p className="text-[11px] uppercase tracking-widest text-white/28">Deadline</p>
                  <p className="mt-1">{new Date(item.entry_deadline).toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to={`/tournaments/${item.tournament_id}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/40 bg-cyan-300/12 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-cyan-100 transition hover:bg-cyan-300/18"
                >
                  View tournament
                </Link>
                <button
                  type="button"
                  onClick={() => void handleUnfollow(item.tournament_id)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/4 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-white/70 transition hover:bg-white/8 hover:text-white"
                >
                  Unfollow
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
