import { useEffect, useMemo, useState } from "react";
import type { CreateTournamentDto } from "../../models/tournament/TournamentTypes";
import { tournamentApi } from "../../api_services/tournament/TournamentAPIService";
import { gamesApi } from "../../api_services/games/GamesAPIService";
import type { GameDto } from "../../models/game/GameTypes";
import { ErrorBox, Spinner, SuccessBox } from "../ui/UI";

type TournamentFormat = CreateTournamentDto["format"];
type TournamentStatus = CreateTournamentDto["status"];

const formatOptions: Array<{ value: TournamentFormat; label: string }> = [
  { value: "single_elimination", label: "Single Elimination" },
  { value: "double_elimination", label: "Double Elimination" },
  { value: "round_robin", label: "Round Robin" },
];

const statusOptions: Array<{ value: TournamentStatus; label: string }> = [
  { value: "upcoming", label: "Upcoming" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
];

function toApiDate(value: string): string {
  return value ? new Date(value).toISOString() : new Date().toISOString();
}

function getInitialForm(defaultGameId: number): CreateTournamentDto {
  return {
    name: "",
    game_id: defaultGameId,
    format: "single_elimination",
    max_teams: 8,
    entry_deadline: "",
    prize_pool: 0,
    status: "upcoming",
  };
}

export function TournamentCreateForm() {
  const [games, setGames] = useState<GameDto[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [gamesError, setGamesError] = useState("");
  const [form, setForm] = useState<CreateTournamentDto>(getInitialForm(0));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadGames() {
      setGamesLoading(true);
      setGamesError("");

      const res = await gamesApi.getAll();
      if (!active) return;

      if (!res.success) {
        setGames([]);
        setGamesError(res.message || "Failed to load games.");
        setGamesLoading(false);
        return;
      }

      const list = res.data ?? [];
      setGames(list);
      setForm((prev) => {
        if (list.length === 0) {
          return { ...prev, game_id: 0 };
        }

        const hasSelectedGame = list.some((game) => game.game_id === prev.game_id);
        return hasSelectedGame ? prev : { ...prev, game_id: list[0].game_id };
      });
      setGamesLoading(false);
    }

    loadGames();

    return () => {
      active = false;
    };
  }, []);

  const canSubmit = useMemo(() => {
    return (
      form.name.trim().length >= 3 &&
      !gamesLoading &&
      games.length > 0 &&
      form.game_id > 0 &&
      form.max_teams >= 2 &&
      form.prize_pool >= 0 &&
      form.entry_deadline !== ""
    );
  }, [form, games.length, gamesLoading]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!canSubmit) {
      if (games.length === 0) {
        setError("Please create at least one game first before creating tournaments.");
        return;
      }
      setError("Please fill all required fields correctly.");
      return;
    }

    setIsSubmitting(true);
    const payload: CreateTournamentDto = {
      ...form,
      name: form.name.trim(),
      entry_deadline: toApiDate(form.entry_deadline),
    };

    try {
      const res = await tournamentApi.create(payload);
      if (!res.success) {
        setError(res.message || "Failed to create tournament.");
        return;
      }

      setSuccess("Tournament created successfully.");
      setForm(getInitialForm(games[0]?.game_id ?? 0));
    } finally {
      setIsSubmitting(false);
    }
  }

  const labelClass = "text-[11px] uppercase tracking-[0.18em] text-white/45 font-medium";
  const inputClass = "h-11 rounded-xl border border-white/12 bg-black/30 px-3 text-sm text-white placeholder:text-white/25 outline-none transition-all focus:border-cyan-300/65 focus:bg-black/40 focus:shadow-[0_0_0_3px_rgba(103,232,249,0.12)]";

  return (
    <form onSubmit={onSubmit} className="relative overflow-hidden rounded-3xl border border-white/12 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_42%),linear-gradient(to_bottom,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 md:p-8 backdrop-blur-sm">
      <div className="pointer-events-none absolute -top-16 -left-14 h-44 w-44 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-40 w-40 rounded-full bg-sky-200/10 blur-3xl" />

      <div className="relative mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-100/65 font-mono">Tournament setup</p>
          <h2 className="mt-2 text-xl font-semibold text-white tracking-tight">Create a tournament</h2>
          <p className="mt-2 text-sm leading-6 text-white/35 max-w-2xl">Select a game, choose competition format, and configure team capacity and deadline before publishing.</p>
        </div>
        <div className="hidden md:inline-flex items-center rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-cyan-100/80">
          Admin only
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-2 md:col-span-2">
          <span className={labelClass}>Tournament Name</span>
          <input
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Spring Clash 2026"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className={labelClass}>Game</span>
          <select
            value={form.game_id > 0 ? String(form.game_id) : ""}
            onChange={(e) => setForm((prev) => ({ ...prev, game_id: Number(e.target.value || 0) }))}
            disabled={gamesLoading || games.length === 0}
            className={`${inputClass} disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {gamesLoading && <option value="">Loading games...</option>}
            {!gamesLoading && games.length === 0 && <option value="">No games available</option>}
            {!gamesLoading && games.map((game) => (
              <option key={game.game_id} value={game.game_id} className="bg-[#0d1117]">
                {game.title}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className={labelClass}>Format</span>
          <select
            value={form.format}
            onChange={(e) => setForm((prev) => ({ ...prev, format: e.target.value as TournamentFormat }))}
            className={inputClass}
          >
            {formatOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#0d1117]">
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className={labelClass}>Max Teams</span>
          <input
            type="number"
            min={2}
            value={form.max_teams}
            onChange={(e) => setForm((prev) => ({ ...prev, max_teams: Number(e.target.value || 2) }))}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className={labelClass}>Entry Deadline</span>
          <input
            type="datetime-local"
            value={form.entry_deadline}
            onChange={(e) => setForm((prev) => ({ ...prev, entry_deadline: e.target.value }))}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className={labelClass}>Prize Pool</span>
          <input
            type="number"
            min={0}
            value={form.prize_pool}
            onChange={(e) => setForm((prev) => ({ ...prev, prize_pool: Number(e.target.value || 0) }))}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className={labelClass}>Status</span>
          <select
            value={form.status}
            onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as TournamentStatus }))}
            className={inputClass}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#0d1117]">
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 space-y-3">
        {gamesError && <ErrorBox message={gamesError} />}
        {error && <ErrorBox message={error} />}
        {success && <SuccessBox message={success} />}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting || !canSubmit}
          className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-cyan-300/45 bg-linear-to-r from-cyan-300/20 to-sky-300/10 text-cyan-50 text-sm font-semibold tracking-wide hover:from-cyan-300/30 hover:to-sky-300/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isSubmitting && <Spinner size={14} />}
          Create Tournament
        </button>
        <span className="text-xs text-white/30">Only admins can access this action.</span>
      </div>
    </form>
  );
}