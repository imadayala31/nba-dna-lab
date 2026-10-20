// NBA_DNA_STAGE30A2_HIDDEN_TWIN_ENGINE
// Exploratory statistical similarity, not player value.

export const TWIN_METRICS = [
  ["points_per_36", "Scoring"],
  ["assists_per_36", "Playmaking"],
  ["turnovers_per_36", "Turnovers"],
  ["rebounds_per_36", "Rebounding"],
  ["three_attempts_per_36", "Three-point volume"],
  ["true_shooting_pct", "Scoring efficiency"],
  ["three_point_pct", "Three-point accuracy"],
  ["steals_per_36", "Steals"],
  ["blocks_per_36", "Blocks"],
];

const numeric = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

export function eligibleTwinPlayer(player) {
  return Boolean(
    player &&
    player.historical_metrics_usable === true &&
    numeric(player.historical_minutes) >= 500
  );
}

export function buildTwinModel(players) {
  const eligible = (Array.isArray(players) ? players : [])
    .filter(eligibleTwinPlayer);

  const stats = Object.fromEntries(
    TWIN_METRICS.map(([key]) => {
      const values = eligible
        .map(player => numeric(player[key]))
        .filter(value => value !== null);
      const mean = values.length
        ? values.reduce((a, b) => a + b, 0) / values.length
        : 0;
      const variance = values.length
        ? values.reduce((sum, value) =>
            sum + (value - mean) ** 2, 0) / values.length
        : 0;
      return [key, { mean, sd: Math.sqrt(variance) }];
    })
  );

  return { eligible, stats };
}

export function findHiddenTwins(model, player, limit = 3) {
  if (!model || !eligibleTwinPlayer(player)) return [];
  const { eligible, stats } = model;

  const matches = eligible
    .filter(candidate =>
      candidate.player !== player.player ||
      candidate.team !== player.team
    )
    .filter(candidate => candidate.team !== player.team)
    .map(candidate => {
      const differences = TWIN_METRICS.flatMap(([key, label]) => {
        const a = numeric(player[key]);
        const b = numeric(candidate[key]);
        const sd = stats[key]?.sd;
        if (a === null || b === null || !(sd > 0)) return [];
        return [{
          key, label,
          playerValue: a, candidateValue: b,
          difference: Math.abs(a - b) / sd
        }];
      });

      if (differences.length < 6) return null;

      // RMS standardized distance; available metrics only.
      const distance = Math.sqrt(
        differences.reduce((sum, item) =>
          sum + item.difference ** 2, 0) / differences.length
      );

      const ordered = [...differences].sort(
        (a, b) => a.difference - b.difference
      );

      return {
        player: candidate,
        distance,
        metricCount: differences.length,
        similarities: ordered.slice(0, 3),
        differences: ordered.slice(-2).reverse()
      };
    })
    .filter(Boolean)
    .sort((a, b) =>
      a.distance - b.distance ||
      a.player.player.localeCompare(b.player.player)
    );

  const safeLimit = Number.isFinite(limit)
    ? Math.max(0, Math.floor(limit)) : 3;
  return matches.slice(0, safeLimit);
}
