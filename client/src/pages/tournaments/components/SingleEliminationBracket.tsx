import { useMemo } from "react";
import type { BracketMatch } from "./tournamentUtils";
import { buildSingleEliminationLayout } from "./tournamentUtils";
import { resolveBracketSlotLabel } from "./tournamentUtils";

export default function SingleEliminationBracket({
  matches,
  onSelectMatch,
  incomingSlotLookup,
}: {
  matches: BracketMatch[];
  onSelectMatch: (matchId: number) => void;
  incomingSlotLookup: Map<string, BracketMatch>;
}) {
  const layout = useMemo(() => buildSingleEliminationLayout(matches), [matches]);

  if (matches.length === 0) {
    return <div className="p-4 text-white/50">No bracket rounds available yet.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max rounded-3xl border border-white/10 bg-linear-to-b from-white/10 to-white/5 p-5 text-white shadow-lg shadow-black/20 backdrop-blur-md">
        <div className="mb-5 flex items-center gap-3 border-b border-white/10 pb-3">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-white/35">Bracket</p>
            <h3 className="text-sm font-semibold text-white">Single Elimination</h3>
          </div>
          <div className="ml-auto hidden gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-white/35 md:flex">
            {layout.roundLabels.map((label) => (
              <span key={label} className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{label}</span>
            ))}
          </div>
        </div>

        <div className="relative" style={{ width: layout.boardWidth + 80, height: layout.boardHeight + 40 }}>
          <svg
            className="pointer-events-none absolute inset-0"
            width={layout.boardWidth + 80}
            height={layout.boardHeight + 40}
            viewBox={`0 0 ${layout.boardWidth + 80} ${layout.boardHeight + 40}`}
            fill="none"
          >
            <g stroke="rgba(148,163,184,0.35)" strokeWidth="1.5" strokeLinecap="square">
              {layout.connectors.map(({ from, to }, index) => {
                const child = layout.positions.get(from);
                const parent = layout.positions.get(to);
                if (!child || !parent) {
                  return <></>;
                }

                const childRight = 40 + child.x + 180;
                const childCenterY = 20 + child.y + 26;
                const parentLeft = 40 + parent.x;
                const parentCenterY = 20 + parent.y + 26;
                const elbowX = childRight + 16;

                return (
                  <g key={`${from}-${to}-${index}`}>
                    <line x1={childRight} y1={childCenterY} x2={elbowX} y2={childCenterY} />
                    <line x1={elbowX} y1={childCenterY} x2={elbowX} y2={parentCenterY} />
                    <line x1={elbowX} y1={parentCenterY} x2={parentLeft} y2={parentCenterY} />
                  </g>
                );
              })}
            </g>
          </svg>

          {matches.map((match) => {
            const position = layout.positions.get(match.match_id);
            if (!position) {
              return <></>;
            }

            return (
              <button
                key={match.match_id}
                type="button"
                onClick={() => onSelectMatch(match.match_id)}
                className="absolute w-45 rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-left shadow-lg shadow-black/20 backdrop-blur-md transition hover:border-cyan-400/30 hover:bg-white/8"
                style={{ left: 40 + position.x, top: 20 + position.y }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/45">Match #{match.match_id}</span>
                  <span className="text-[10px] uppercase tracking-[0.16em] text-cyan-100/80">
                    {match.result && match.result !== "" ? match.result : (match.status || "scheduled")}
                  </span>
                </div>
                <div className="mt-2 space-y-1 text-xs text-white/75">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-white/35">T1</span>
                    <span className="truncate">{resolveBracketSlotLabel(match, "team1", incomingSlotLookup)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-white/35">T2</span>
                    <span className="truncate">{resolveBracketSlotLabel(match, "team2", incomingSlotLookup)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
