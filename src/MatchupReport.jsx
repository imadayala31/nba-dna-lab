
import "./MatchupReport.css";

const valid = (value) =>
  typeof value === "number" &&
  Number.isFinite(value);

const number = (value, digits = 1) =>
  valid(value) ? value.toFixed(digits) : "—";

const percent = (value) =>
  valid(value)
    ? `${(value * 100).toFixed(1)}%`
    : "—";

function season(value) {
  return valid(value)
    ? `${value - 1}–${String(value).slice(-2)}`
    : "NOT AVAILABLE";
}

function colorFor(team) {
  const colors = {
    "Atlanta Hawks": "#C8102E",
    "Boston Celtics": "#007A33",
    "Brooklyn Nets": "#333333",
    "Charlotte Hornets": "#00788C",
    "Chicago Bulls": "#CE1141",
    "Cleveland Cavaliers": "#860038",
    "Dallas Mavericks": "#00538C",
    "Denver Nuggets": "#0E2240",
    "Detroit Pistons": "#C8102E",
    "Golden State Warriors": "#1D428A",
    "Houston Rockets": "#CE1141",
    "Indiana Pacers": "#002D62",
    "Los Angeles Clippers": "#C8102E",
    "LA Clippers": "#C8102E",
    "Los Angeles Lakers": "#552583",
    "Memphis Grizzlies": "#5D76A9",
    "Miami Heat": "#98002E",
    "Milwaukee Bucks": "#00471B",
    "Minnesota Timberwolves": "#0C2340",
    "New Orleans Pelicans": "#0C2340",
    "New York Knicks": "#006BB6",
    "Oklahoma City Thunder": "#007AC1",
    "Orlando Magic": "#0077C0",
    "Philadelphia 76ers": "#006BB6",
    "Phoenix Suns": "#E56020",
    "Portland Trail Blazers": "#E03A3E",
    "Sacramento Kings": "#5A2D81",
    "San Antonio Spurs": "#555555",
    "Toronto Raptors": "#CE1141",
    "Utah Jazz": "#4B2B7F",
    "Washington Wizards": "#002B5C",
  };

  return colors[team] || "#334155";
}

function hasEvidence(player, keys) {
  return Boolean(
    player?.historical_metrics_usable &&
      valid(player.historical_minutes) &&
      player.historical_minutes >= 500 &&
      keys.every((key) => valid(player[key]))
  );
}

function comparisonText(a, b, key, description) {
  if (!valid(a[key]) || !valid(b[key])) {
    return "The available data cannot support this comparison.";
  }

  const difference = a[key] - b[key];

  if (Math.abs(difference) < 0.000001) {
    return `Both players recorded the same ${description}.`;
  }

  const higher = difference > 0 ? a : b;

  return `${higher.player} recorded the higher ${description} in the historical sample.`;
}

function StatPair({
  a,
  b,
  metric,
  label,
  explanation,
  format = number,
}) {
  return (
    <div className="matchup-stat-block">
      <div className="matchup-stat-heading">
        <strong>{label}</strong>
        <span>{explanation}</span>
      </div>

      <div className="matchup-stat-pair">
        {[a, b].map((player, index) => (
          <div
            key={`${index}-${player.team}-${player.player}`}
            className="matchup-stat-player"
            style={{
              "--report-team": colorFor(player.team),
            }}
          >
            <span className="matchup-stat-name">
              {player.player}
            </span>

            <strong className="matchup-stat-value">
              {format(player[metric])}
            </strong>

            <span className="matchup-stat-team">
              {player.team}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportCard({
  index,
  category,
  title,
  subtitle,
  status,
  children,
}) {
  return (
    <article className="matchup-report-card">
      <div className="matchup-report-card-top">
        <span>{index} / {category}</span>
        <span className="matchup-report-status">
          {status}
        </span>
      </div>

      <h4>{title}</h4>

      <p className="matchup-report-subtitle">
        {subtitle}
      </p>

      <div className="matchup-report-card-body">
        {children}
      </div>
    </article>
  );
}

function Takeaway({ children }) {
  return (
    <div className="matchup-report-takeaway">
      <span>THE READ</span>
      <p>{children}</p>
    </div>
  );
}

function ScoringCard({ a, b }) {
  const keys = [
    "points_per_36",
    "true_shooting_pct",
  ];

  const ready =
    hasEvidence(a, keys) &&
    hasEvidence(b, keys);

  return (
    <ReportCard
      index="01"
      category="SCORING PROFILE"
      title="Who scores more?"
      subtitle="Scoring volume and shooting efficiency are not the same thing."
      status={ready ? "COMPARABLE" : "LIMITED DATA"}
    >
      {ready ? (
        <>
          <StatPair
            a={a}
            b={b}
            metric="points_per_36"
            label="POINTS PER 36 MINUTES"
            explanation="Scoring rate adjusted to 36 minutes of playing time"
          />

          <StatPair
            a={a}
            b={b}
            metric="true_shooting_pct"
            label="TRUE SHOOTING %"
            explanation="Scoring efficiency across field goals and free throws"
            format={percent}
          />

          <Takeaway>
            {comparisonText(
              a,
              b,
              "points_per_36",
              "scoring rate"
            )}{" "}
            {comparisonText(
              a,
              b,
              "true_shooting_pct",
              "true shooting percentage"
            )}{" "}
            Higher scoring volume does not
            automatically mean higher efficiency.
          </Takeaway>
        </>
      ) : (
        <Takeaway>
          A responsible scoring comparison needs
          verified points per 36, true shooting
          percentage and at least 500 historical
          minutes for both players.
        </Takeaway>
      )}
    </ReportCard>
  );
}

function PlaymakingCard({ a, b }) {
  const keys = [
    "assists_per_36",
    "turnovers_per_36",
  ];

  const ready =
    hasEvidence(a, keys) &&
    hasEvidence(b, keys);

  const ratio = (player) =>
    valid(player.assists_per_36) &&
    valid(player.turnovers_per_36) &&
    player.turnovers_per_36 > 0
      ? player.assists_per_36 /
        player.turnovers_per_36
      : null;

  return (
    <ReportCard
      index="02"
      category="PLAYMAKING PROFILE"
      title="Who creates more?"
      subtitle="Assists, turnovers and the balance between them."
      status={ready ? "COMPARABLE" : "LIMITED DATA"}
    >
      {ready ? (
        <>
          <StatPair
            a={a}
            b={b}
            metric="assists_per_36"
            label="ASSISTS PER 36 MINUTES"
            explanation="Passes that directly led to made baskets"
          />

          <StatPair
            a={a}
            b={b}
            metric="turnovers_per_36"
            label="TURNOVERS PER 36 MINUTES"
            explanation="Possessions lost through recorded turnovers"
          />

          <div className="matchup-ratio-heading">
            <strong>ASSIST-TO-TURNOVER RATIO</strong>
            <span>
              Recorded assists for every recorded
              turnover
            </span>
          </div>

          <div className="matchup-ratio-grid">
            {[a, b].map((player, index) => (
              <div
                key={`${index}-${player.player}`}
                style={{
                  "--report-team": colorFor(player.team),
                }}
              >
                <span>{player.player}</span>
                <strong>
                  {ratio(player) === null
                    ? "—"
                    : number(ratio(player), 2)}
                </strong>
              </div>
            ))}
          </div>

          <Takeaway>
            {comparisonText(
              a,
              b,
              "assists_per_36",
              "assist rate"
            )}{" "}
            Turnovers and assist-to-turnover ratio
            add context, but neither captures
            offensive role, touches or decision
            difficulty on its own.
          </Takeaway>
        </>
      ) : (
        <Takeaway>
          Both players need usable assists and
          turnovers per 36, plus at least 500
          historical minutes, for this comparison.
        </Takeaway>
      )}
    </ReportCard>
  );
}

function PerimeterCard({ a, b }) {
  const keys = [
    "three_attempts_per_36",
    "three_point_pct",
  ];

  const ready =
    hasEvidence(a, keys) &&
    hasEvidence(b, keys);

  return (
    <ReportCard
      index="03"
      category="PERIMETER PROFILE"
      title="Who shoots more threes?"
      subtitle="Three-point volume and accuracy tell different stories."
      status={ready ? "COMPARABLE" : "LIMITED DATA"}
    >
      {ready ? (
        <>
          <StatPair
            a={a}
            b={b}
            metric="three_attempts_per_36"
            label="THREE-POINT ATTEMPTS / 36"
            explanation="How frequently each player shoots from three"
          />

          <StatPair
            a={a}
            b={b}
            metric="three_point_pct"
            label="THREE-POINT ACCURACY"
            explanation="Share of three-point attempts that went in"
            format={percent}
          />

          <Takeaway>
            {comparisonText(
              a,
              b,
              "three_attempts_per_36",
              "three-point attempt rate"
            )}{" "}
            {comparisonText(
              a,
              b,
              "three_point_pct",
              "three-point accuracy"
            )}{" "}
            Shot difficulty and defensive attention
            are not measured here.
          </Takeaway>
        </>
      ) : (
        <Takeaway>
          A complete perimeter comparison requires
          verified three-point attempt rate,
          accuracy and at least 500 historical
          minutes for both players.
        </Takeaway>
      )}
    </ReportCard>
  );
}

function EvidenceCard({ a, b }) {
  const players = [a, b];

  const ready = players.every(
    (player) =>
      player.historical_metrics_usable &&
      valid(player.historical_minutes) &&
      player.historical_minutes >= 500
  );

  return (
    <ReportCard
      index="04"
      category="EVIDENCE QUALITY"
      title="How reliable is the sample?"
      subtitle="Before comparing players, check how much historical evidence we have."
      status={
        ready
          ? "PEER-ELIGIBLE"
          : "REVIEW REQUIRED"
      }
    >
      <div className="matchup-evidence-grid">
        {players.map((player, index) => (
          <div
            key={`${index}-${player.player}`}
            className="matchup-evidence-player"
            style={{
              "--report-team": colorFor(player.team),
            }}
          >
            <span>{player.player}</span>

            <strong>
              {valid(player.historical_minutes)
                ? Math.round(
                    player.historical_minutes
                  ).toLocaleString()
                : "—"}
            </strong>

            <small>HISTORICAL MINUTES</small>

            <div className="matchup-evidence-season">
              <span>
                SEASON {season(player.profile_season)}
              </span>

              <span>
                {player.sample_tier ||
                  "SAMPLE UNKNOWN"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="matchup-evidence-explainer">
        <strong>WHAT DOES 500 MINUTES MEAN?</strong>

        <p>
          NBA DNA LAB uses 500 recorded historical
          minutes as the minimum threshold for
          displaying peer percentiles. It is a
          sample filter, not a guarantee of
          statistical reliability.
        </p>
      </div>

      <Takeaway>
        {ready
          ? "Both players pass the minimum historical-minute threshold. Their roles, sample sizes and playing contexts may still differ."
          : "At least one player lacks usable historical metrics or falls below the minimum-minute threshold. Some comparisons are intentionally withheld."}
        {a.profile_season !== b.profile_season
          ? " These profiles also come from different historical seasons."
          : ""}
      </Takeaway>
    </ReportCard>
  );
}

export default function MatchupReport({
  playerA,
  playerB,
}) {
  if (!playerA || !playerB) return null;

  return (
    <section
      className="matchup-report"
      aria-label="Historical matchup report"
    >
      <div className="matchup-report-heading">
        <div>
          <span className="matchup-report-eyebrow">
            10 / COMPARATIVE INTELLIGENCE
          </span>

          <h3>THE MATCHUP REPORT.</h3>

          <p>
            The numbers, explained. Four ways to
            understand two NBA players — whether
            you know every stat or are just
            getting started.
          </p>
        </div>

        <span className="matchup-report-edition">
          NBA DNA LAB / RESEARCH NOTE
        </span>
      </div>

      <div className="matchup-report-legend">
        <div>
          <span
            className="matchup-legend-dot"
            style={{
              background: colorFor(playerA.team),
            }}
          />

          <strong>{playerA.player}</strong>
          <span>{playerA.team}</span>
        </div>

        <span className="matchup-legend-vs">
          VS
        </span>

        <div>
          <span
            className="matchup-legend-dot"
            style={{
              background: colorFor(playerB.team),
            }}
          />

          <strong>{playerB.player}</strong>
          <span>{playerB.team}</span>
        </div>
      </div>

      <div className="matchup-report-grid">
        <ScoringCard a={playerA} b={playerB} />

        <PlaymakingCard a={playerA} b={playerB} />

        <PerimeterCard a={playerA} b={playerB} />

        <EvidenceCard a={playerA} b={playerB} />
      </div>

      <div className="matchup-report-footer">
        <strong>
          THE EVIDENCE IS THE STORY.
        </strong>

        <p>
          All statistics describe verified
          historical NBA performance, not
          projected 2026–27 production. Per-36
          rates normalize recorded production
          by playing time; they do not guarantee
          the same output in a different role.
          No overall player ranking or win
          forecast is generated.
        </p>
      </div>
    </section>
  );
}
