import React from "react";
import { Table, TableHead } from "../../../components/ui/UI";
import { formatDateTime, formatTeamId } from "./tournamentUtils";
import type { BracketMatch } from "./tournamentUtils";

export default function RoundRobinTable({ matches, onSelectMatch }: { matches: BracketMatch[]; onSelectMatch: (id: number) => void }) {
  return (
    <Table>
      <TableHead columns={["Match ID", "Team 1", "Team 2", "Scheduled", "Result"]} />
      <tbody>
        {matches.map((match) => (
          <tr
            key={match.match_id}
            className="border-b last:border-b-0 border-white/6 hover:bg-white/3 transition-colors cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={() => onSelectMatch(match.match_id)}
            onKeyDown={(e) => { if ((e as React.KeyboardEvent).key === 'Enter') onSelectMatch(match.match_id); }}
          >
            <td className="px-5 py-4 text-white/85 font-medium">#{match.match_id}</td>
            <td className="px-5 py-4 text-white/70">{formatTeamId(match.team1_id)}</td>
            <td className="px-5 py-4 text-white/70">{formatTeamId(match.team2_id)}</td>
            <td className="px-5 py-4 text-white/70">{formatDateTime(match.scheduled_at)}</td>
            <td className="px-5 py-4 text-white/80">{match.result && match.result !== "" ? match.result : "-"}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
