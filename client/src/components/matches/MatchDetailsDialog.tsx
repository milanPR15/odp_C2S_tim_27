import { useEffect, useState } from "react";
import { Modal, Spinner, ErrorBox, Empty } from "../ui/UI";
import { matchesApi } from "../../api_services/matches/MatchesAPIService";
import type { MatchDto, UpdateMatchResultPayload } from "../../api_services/matches/IMatchesAPIService";

const EMPTY_MATCH: MatchDto = {
  match_id: 0,
  tournament_id: 0,
  team1_id: 0,
  team2_id: 0,
  scheduled_at: "",
  result: "",
  next_match_id: 0,
  next_match_slot: "",
  loser_next_match_id: 0,
  loser_next_match_slot: "",
  status: "scheduled",
};

function formatDateTime(value: string) {
  if (!value) return "-";
  const p = new Date(value);
  if (Number.isNaN(p.getTime())) return "-";
  return p.toLocaleString();
}

export function MatchDetailsDialog({
  matchId,
  isOpen,
  onClose,
}: {
  matchId: number;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [match, setMatch] = useState<MatchDto>(EMPTY_MATCH);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [editResult, setEditResult] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  useEffect(() => {
    let active = true;
    if (!isOpen || matchId === 0) {
      setMatch(EMPTY_MATCH);
      setError("");
      setIsLoading(false);
      return () => {
        active = false;
      };
    }

    setIsLoading(true);
    setError("");

    matchesApi.getMatchById(matchId)
      .then((res) => {
        if (!active) return;
        if (!res.success || !res.data) {
          setError(res.message || "Failed to load match details.");
          setMatch(EMPTY_MATCH);
          return;
        }
        setMatch(res.data);
        setEditResult(res.data.result || "");
      })
      .catch(() => {
        if (!active) return;
        setError("Failed to load match details.");
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, matchId]);

  async function handleSave() {
    if (match.match_id === 0) return;
    setSaveError("");
    setSaveSuccess("");
    setIsSaving(true);
    const payload: UpdateMatchResultPayload = { result: editResult };
    try {
      const res = await matchesApi.updateMatchResult(match.match_id, payload);
      if (!res.success) {
        setSaveError(res.message || "Failed to save result.");
      } else {
        setMatch({ ...match, result: editResult });
        setSaveSuccess("Saved");
      }
    } catch{
      setSaveError("Failed to save result.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={match.match_id !== 0 ? `Match #${match.match_id}` : "Match details"}>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner size={28} />
        </div>
      ) : error ? (
        <ErrorBox message={error} />
      ) : match.match_id !== 0 ? (
        <>
        <div className="space-y-3 text-sm text-white/85">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-white/30 uppercase tracking-widest">Match ID</p>
              <p className="font-medium">#{match.match_id}</p>
            </div>
            <div>
              <p className="text-xs text-white/30 uppercase tracking-widest">Tournament</p>
              <p className="font-medium">#{match.tournament_id}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-white/30 uppercase tracking-widest">Team 1</p>
              <p className="font-medium">{!match.team1_id || match.team1_id === 0 ? "TBD" : `Team ${match.team1_id}`}</p>
            </div>
            <div>
              <p className="text-xs text-white/30 uppercase tracking-widest">Team 2</p>
              <p className="font-medium">{!match.team2_id || match.team2_id === 0 ? "TBD" : `Team ${match.team2_id}`}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-white/30 uppercase tracking-widest">Scheduled</p>
            <p className="font-medium">{formatDateTime(match.scheduled_at)}</p>
          </div>

          <div>
            <p className="text-xs text-white/30 uppercase tracking-widest">Result</p>
            <p className="font-medium">{match.result && match.result !== "" ? match.result : "-"}</p>
          </div>
        </div>

          <div className="pt-4 border-t border-white/6">
            <label className="block text-xs text-white/30 uppercase tracking-widest mb-2">Update result</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={editResult}
                onChange={(e) => setEditResult(e.target.value)}
                className="flex-1 rounded-lg border border-white/8 bg-white/3 px-3 py-2 text-sm text-white/90 focus:outline-none"
                placeholder="e.g. Team 1 2-1 Team 2"
                aria-label="Match result"
              />
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || editResult.trim() === "" || editResult === match.result}
                className="rounded-lg bg-cyan-500/20 border border-cyan-500/20 px-4 py-2 text-sm text-cyan-200 hover:bg-cyan-500/30 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
            {saveError && <div className="mt-2"><ErrorBox message={saveError} /></div>}
            {saveSuccess && <div className="mt-2 text-sm text-emerald-300">{saveSuccess}</div>}
          </div>
        </>
      ) : (
        <Empty message="No match details available." />
      )}
    </Modal>
  );
}

export default MatchDetailsDialog;
