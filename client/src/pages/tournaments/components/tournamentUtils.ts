import type { MatchDto } from "../../../api_services/matches/IMatchesAPIService";

export type BracketMatch = MatchDto;

export type BracketRound = {
  label: string;
  matches: BracketMatch[];
};

export type BracketPosition = {
  match: BracketMatch;
  x: number;
  y: number;
  roundIndex: number;
};

export type BracketSlot = "team1" | "team2";

export function formatDateTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString();
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatTeamId(teamId: number): string {
  if (!teamId || teamId === 0) return "TBD";
  return `Team ${teamId}`;
}

export function isMatchCompleted(match: BracketMatch): boolean {
  const state = match.status || (match.result && match.result !== "" ? "completed" : "scheduled");
  return state === "completed";
}

export function getWinnerTeamId(match: BracketMatch): number {
  if (!isMatchCompleted(match) || !match.result || match.result === "") {
    return 0;
  }

  const [leftScoreRaw, rightScoreRaw] = match.result.split(":");
  const leftScore = Number(leftScoreRaw);
  const rightScore = Number(rightScoreRaw);

  if (Number.isNaN(leftScore) || Number.isNaN(rightScore) || leftScore === rightScore) {
    return 0;
  }

  return leftScore > rightScore ? match.team1_id : match.team2_id;
}

export function buildIncomingSlotLookup(matches: BracketMatch[]): Map<string, BracketMatch> {
  const lookup = new Map<string, BracketMatch>();

  matches.forEach((match) => {
    if (match.next_match_id && match.next_match_id > 0 && match.next_match_slot) {
      lookup.set(`${match.next_match_id}:${match.next_match_slot}`, match);
    }
  });

  return lookup;
}

export function resolveBracketSlotLabel(
  parentMatch: BracketMatch,
  slot: BracketSlot,
  incomingSlotLookup: Map<string, BracketMatch>
): string {
  const sourceMatch = incomingSlotLookup.get(`${parentMatch.match_id}:${slot}`);
  if (!sourceMatch) {
    return formatTeamId(slot === "team1" ? parentMatch.team1_id : parentMatch.team2_id);
  }

  const winnerTeamId = getWinnerTeamId(sourceMatch);
  return winnerTeamId === 0 ? "TBD" : formatTeamId(winnerTeamId);
}

export function buildDepthLookup(matches: BracketMatch[]): Map<number, number> {
  const byId = new Map(matches.map((match) => [match.match_id, match]));
  const depthLookup = new Map<number, number>();

  function resolveDepth(matchId: number): number {
    const cachedDepth = depthLookup.get(matchId);
    if (cachedDepth !== undefined) {
      return cachedDepth;
    }

    const match = byId.get(matchId);
    if (!match || !match.next_match_id) {
      depthLookup.set(matchId, 0);
      return 0;
    }

    const depth = resolveDepth(match.next_match_id) + 1;
    depthLookup.set(matchId, depth);
    return depth;
  }

  matches.forEach((match) => {
    resolveDepth(match.match_id);
  });

  return depthLookup;
}

export function groupMatchesIntoRounds(matches: BracketMatch[]): BracketRound[] {
  if (matches.length === 0) {
    return [];
  }

  const depthLookup = buildDepthLookup(matches);
  const grouped = new Map<number, BracketMatch[]>();

  matches.forEach((match) => {
    const depth = depthLookup.get(match.match_id) ?? 0;
    const bucket = grouped.get(depth) ?? [];
    bucket.push(match);
    grouped.set(depth, bucket);
  });

  return [...grouped.entries()]
    .sort(([leftDepth], [rightDepth]) => rightDepth - leftDepth)
    .map(([, roundMatches], index) => ({
      label: `Round ${index + 1}`,
      matches: [...roundMatches].sort((left, right) => left.match_id - right.match_id),
    }));
}

export function matchDestination(match: BracketMatch): string {
  if (match.next_match_id && match.next_match_id > 0) {
    return `Winner advances to #${match.next_match_id}`;
  }

  if (match.loser_next_match_id && match.loser_next_match_id > 0) {
    return `Loser drops to #${match.loser_next_match_id}`;
  }

  return "";
}

export function buildSingleEliminationLayout(matches: BracketMatch[]): {
  positions: Map<number, BracketPosition>;
  connectors: Array<{ from: number; to: number }>;
  boardWidth: number;
  boardHeight: number;
  roundLabels: string[];
} {
  const depthLookup = buildDepthLookup(matches);
  const maxDepth = Math.max(0, ...depthLookup.values());
  const roundCount = maxDepth + 1;
  const columnGap = 220;
  const rowGap = 78;
  const cardWidth = 180;
  const cardHeight = 52;

  const childrenByParent = new Map<number, BracketMatch[]>();

  matches.forEach((match) => {
    if (!match.next_match_id) {
      return;
    }

    const children = childrenByParent.get(match.next_match_id) ?? [];
    children.push(match);
    childrenByParent.set(match.next_match_id, children);
  });

  const positions = new Map<number, BracketPosition>();
  const connectors: Array<{ from: number; to: number }> = [];
  let leafIndex = 0;

  const sortChildren = (children: BracketMatch[]): BracketMatch[] => [...children].sort((left, right) => {
    if (left.next_match_slot === right.next_match_slot) {
      return left.match_id - right.match_id;
    }

    if (left.next_match_slot === "team1") return -1;
    if (right.next_match_slot === "team1") return 1;
    return left.match_id - right.match_id;
  });

  const placeMatch = (match: BracketMatch): number => {
    const existing = positions.get(match.match_id);
    if (existing) {
      return existing.y;
    }

    const roundIndex = maxDepth - (depthLookup.get(match.match_id) ?? 0);
    const x = roundIndex * columnGap;
    const children = sortChildren(childrenByParent.get(match.match_id) ?? []);

    if (children.length === 0) {
      const y = leafIndex * rowGap;
      leafIndex += 1;
      positions.set(match.match_id, { match, x, y, roundIndex });
      return y;
    }

    const childYs = children.map((child) => placeMatch(child));
    const y = (Math.min(...childYs) + Math.max(...childYs)) / 2;
    positions.set(match.match_id, { match, x, y, roundIndex });

    children.forEach((child) => {
      connectors.push({ from: child.match_id, to: match.match_id });
    });

    return y;
  };

  const roots = matches
    .filter((match) => !match.next_match_id)
    .sort((left, right) => left.match_id - right.match_id);

  roots.forEach((root) => {
    placeMatch(root);
  });

  matches
    .filter((match) => !positions.has(match.match_id))
    .sort((left, right) => left.match_id - right.match_id)
    .forEach((match) => {
      placeMatch(match);
    });

  const boardHeight = Math.max(cardHeight, (Math.max(leafIndex, 1) - 1) * rowGap + cardHeight);
  const boardWidth = roundCount * columnGap + cardWidth;
  const roundLabels = Array.from({ length: roundCount }, (_, index) => `Round ${index + 1}`);

  return { positions, connectors, boardWidth, boardHeight, roundLabels };
}
