import { useMemo, useState } from "react";
import type { CreateTournamentDto } from "../../models/tournament/TournamentTypes";
import { tournamentApi } from "../../api_services/tournament/TournamentAPIService";
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

export function TournamentCreateForm() {
  const initialForm: CreateTournamentDto = {
    name: "",
    game_id: 1,
    format: "single_elimination",
    max_teams: 8,
    entry_deadline: "",
    prize_pool: 0,
    status: "upcoming",
  };

  const [form, setForm] = useState<CreateTournamentDto>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canSubmit = useMemo(() => {
    return (
      form.name.trim().length >= 3 &&
      form.game_id > 0 &&
      form.max_teams >= 2 &&
      form.prize_pool >= 0 &&
      form.entry_deadline !== ""
    );
  }, [form]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!canSubmit) {
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
      setForm(initialForm);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-white/10 bg-linear-to-b from-white/6 to-white/2 p-6 md:p-8 backdrop-blur-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-2 md:col-span-2">
          <span className="text-xs uppercase tracking-widest text-white/45">Tournament Name</span>
          <input
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Spring Clash 2026"
            className="h-11 rounded-xl border border-white/15 bg-black/35 px-3 text-sm text-white outline-none focus:border-cyan-300/60 transition-colors"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-widest text-white/45">Game ID</span>
          <input
            type="number"
            min={1}
            value={form.game_id}
            onChange={(e) => setForm((prev) => ({ ...prev, game_id: Number(e.target.value || 1) }))}
            className="h-11 rounded-xl border border-white/15 bg-black/35 px-3 text-sm text-white outline-none focus:border-cyan-300/60 transition-colors"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-widest text-white/45">Format</span>
          <select
            value={form.format}
            onChange={(e) => setForm((prev) => ({ ...prev, format: e.target.value as TournamentFormat }))}
            className="h-11 rounded-xl border border-white/15 bg-black/35 px-3 text-sm text-white outline-none focus:border-cyan-300/60 transition-colors"
          >
            {formatOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#0d1117]">
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-widest text-white/45">Max Teams</span>
          <input
            type="number"
            min={2}
            value={form.max_teams}
            onChange={(e) => setForm((prev) => ({ ...prev, max_teams: Number(e.target.value || 2) }))}
            className="h-11 rounded-xl border border-white/15 bg-black/35 px-3 text-sm text-white outline-none focus:border-cyan-300/60 transition-colors"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-widest text-white/45">Entry Deadline</span>
          <input
            type="datetime-local"
            value={form.entry_deadline}
            onChange={(e) => setForm((prev) => ({ ...prev, entry_deadline: e.target.value }))}
            className="h-11 rounded-xl border border-white/15 bg-black/35 px-3 text-sm text-white outline-none focus:border-cyan-300/60 transition-colors"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-widest text-white/45">Prize Pool</span>
          <input
            type="number"
            min={0}
            value={form.prize_pool}
            onChange={(e) => setForm((prev) => ({ ...prev, prize_pool: Number(e.target.value || 0) }))}
            className="h-11 rounded-xl border border-white/15 bg-black/35 px-3 text-sm text-white outline-none focus:border-cyan-300/60 transition-colors"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-widest text-white/45">Status</span>
          <select
            value={form.status}
            onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as TournamentStatus }))}
            className="h-11 rounded-xl border border-white/15 bg-black/35 px-3 text-sm text-white outline-none focus:border-cyan-300/60 transition-colors"
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
        {error && <ErrorBox message={error} />}
        {success && <SuccessBox message={success} />}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting || !canSubmit}
          className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-cyan-300/40 bg-cyan-300/15 text-cyan-100 text-sm font-medium hover:bg-cyan-300/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isSubmitting && <Spinner size={14} />}
          Create Tournament
        </button>
        <span className="text-xs text-white/35">Only admins can access this action.</span>
      </div>
    </form>
  );
}