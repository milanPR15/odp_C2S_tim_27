import React from "react";
import { Table, TableHead, Empty } from "../../../components/ui/UI";
import { formatDateTime } from "./tournamentUtils";
import type { TournamentRegistrationDto } from "../../../models/tournament/TournamentTypes";

export default function AdminRegistrationsPanel({
  registrations,
  isConfirmingId,
  onConfirm,
}: {
  registrations: TournamentRegistrationDto[];
  isConfirmingId: number;
  onConfirm: (id: number) => void | Promise<void>;
}) {
  if (registrations.length === 0) {
    return (
      <div className="rounded-xl border border-white/8 bg-white/3">
        <Empty message="No registrations found for this tournament." />
      </div>
    );
  }

  return (
    <Table>
      <TableHead columns={["Registration ID", "Team", "Status", "Registered", "Action"]} />
      <tbody>
        {registrations.map((registration) => (
          <tr key={registration.id} className="border-b last:border-b-0 border-white/6">
            <td className="px-5 py-4 text-white/85 font-medium">#{registration.id}</td>
            <td className="px-5 py-4 text-white/70">{registration.team_name && registration.team_name !== "" ? registration.team_name : `Team #${registration.team_id}`} (#{registration.team_id})</td>
            <td className="px-5 py-4 text-white/70">{registration.status}</td>
            <td className="px-5 py-4 text-white/70">{formatDateTime(registration.registered_at)}</td>
            <td className="px-5 py-4 text-white/80">
              {registration.status === "pending" ? (
                <button
                  type="button"
                  onClick={() => void onConfirm(registration.id)}
                  disabled={isConfirmingId === registration.id}
                  className="rounded-lg border border-cyan-300/40 bg-cyan-300/15 px-3 py-2 text-xs font-medium text-cyan-100 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isConfirmingId === registration.id ? "Confirming..." : "Confirm"}
                </button>
              ) : (
                <span className="text-xs text-white/35">Confirmed</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
