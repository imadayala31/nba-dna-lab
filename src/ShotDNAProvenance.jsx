
import React from "react";
import "./ShotDNAProvenance.css";

export default function ShotDNAProvenance({
  dataset = null
}) {
  const season = dataset?.season || "2025-26";
  const competition =
    dataset?.competition || "REGULAR SEASON";

  const seasonLabel =
    String(season).replace("-", "–");

  const competitionLabel =
    String(competition).toUpperCase();

  const isPreseason =
    competitionLabel.includes("PRESEASON");

  const isHistorical =
    season !== "2025-26";

  const isCurrentRegular =
    season === "2025-26" &&
    !isPreseason;

  const acceptedGames =
    dataset?.accepted_games ?? 1185;

  const excludedGames =
    dataset?.quarantined_games_excluded ?? 45;

  const title = isPreseason
    ? `${seasonLabel} PRESEASON`
    : isHistorical
      ? `${seasonLabel} HISTORICAL REGULAR SEASON`
      : `${seasonLabel} REGULAR SEASON`;

  return (
    <section
      className="sd-provenance"
      aria-label="Shot DNA data provenance"
    >
      <div className="sd-provenance__header">
        <div>
          <div className="sd-provenance__eyebrow">
            SHOT DNA / DATA PROVENANCE
          </div>

          <div className="sd-provenance__title">
            {title}
          </div>
        </div>

        <div className="sd-provenance__status">
          PARTIAL COVERAGE
        </div>
      </div>

      {isCurrentRegular && (
        <div className="sd-provenance__metrics">
          <div className="sd-provenance__metric">
            <span>ACCEPTED GAMES</span>
            <strong>
              {Number(acceptedGames).toLocaleString()}
            </strong>
          </div>

          <div className="sd-provenance__metric">
            <span>EXCLUDED GAMES</span>
            <strong>{excludedGames}</strong>
          </div>
        </div>
      )}

      <div className="sd-provenance__details">
        {isCurrentRegular && (
          <p>
            Accepted-game sample only.
            Team box-score totals reconciled.
            Individual player totals pending audit.
          </p>
        )}

        {isHistorical && !isPreseason && (
          <p>
            Historical season fallback.
            Not current-season statistics.
          </p>
        )}

        {isPreseason && (
          <p>
            Exhibition-game sample.
            Not regular-season NBA statistics.
          </p>
        )}

        <p>
          Court-coordinate mapping is provisional.
        </p>
      </div>
    </section>
  );
}

