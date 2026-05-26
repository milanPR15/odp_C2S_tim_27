import { StatusBadge } from "../../../components/ui/UI";
import { formatDateTime } from "./tournamentUtils";
import type { BracketMatch } from "./tournamentUtils";
import { matchDestination, resolveBracketSlotLabel } from "./tournamentUtils";

export default function BracketMatchCard({
  match,
  accentClass,
  incomingSlotLookup,
}: {
  match: BracketMatch;
  accentClass: string;
  incomingSlotLookup: Map<string, BracketMatch>;
}) {
  const destination = matchDestination(match);
  const state = match.status || (match.result && match.result !== "" ? "completed" : "scheduled");
  const team1Label = resolveBracketSlotLabel(match, "team1", incomingSlotLookup);
  const team2Label = resolveBracketSlotLabel(match, "team2", incomingSlotLookup);

  return (
    <article className={`rounded-2xl border ${accentClass} bg-white/5 p-4 shadow-lg shadow-black/15`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-white/35">Match</p>
          <p className="mt-1 text-lg font-semibold text-white">#{match.match_id}</p>
        </div>
        <StatusBadge status={state} />
      </div>

      <div className="mt-4 space-y-2">
        <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/30">Team 1</p>
          <p className={`mt-1 text-sm ${team1Label === "TBD" ? "text-white/45 italic" : "text-white/80"}`}>{team1Label}</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/30">Team 2</p>
          <p className={`mt-1 text-sm ${team2Label === "TBD" ? "text-white/45 italic" : "text-white/80"}`}>{team2Label}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-xs text-white/45">
        <div className="flex items-center justify-between gap-3 rounded-lg bg-white/3 px-3 py-2">
          <span className="uppercase tracking-[0.16em]">Scheduled</span>
          <span>{formatDateTime(match.scheduled_at)}</span>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg bg-white/3 px-3 py-2">
          <span className="uppercase tracking-[0.16em]">Result</span>
          <span className="text-white/75">{match.result && match.result !== "" ? match.result : "Pending"}</span>
        </div>
        {destination && (
          <div className="rounded-lg border border-white/8 bg-black/15 px-3 py-2 text-white/55">
            {destination}
          </div>
        )}
      </div>
    </article>
  );
}
