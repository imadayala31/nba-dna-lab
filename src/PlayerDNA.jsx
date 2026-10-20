
import { useEffect, useMemo, useState } from "react";
import MatchupReport from "./MatchupReport";
import "./PlayerDNA.css";

const DATA_URL =
  "/data/front_office_player_dna_19hf.json";

const TEAM_COLORS = {
  "Atlanta Hawks": "#C8102E",
  "Boston Celtics": "#007A33",
  "Brooklyn Nets": "#222222",
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

const TEAM_CODES = {
  "Atlanta Hawks": "atl",
  "Boston Celtics": "bos",
  "Brooklyn Nets": "bkn",
  "Charlotte Hornets": "cha",
  "Chicago Bulls": "chi",
  "Cleveland Cavaliers": "cle",
  "Dallas Mavericks": "dal",
  "Denver Nuggets": "den",
  "Detroit Pistons": "det",
  "Golden State Warriors": "gs",
  "Houston Rockets": "hou",
  "Indiana Pacers": "ind",
  "Los Angeles Clippers": "lac",
  "LA Clippers": "lac",
  "Los Angeles Lakers": "lal",
  "Memphis Grizzlies": "mem",
  "Miami Heat": "mia",
  "Milwaukee Bucks": "mil",
  "Minnesota Timberwolves": "min",
  "New Orleans Pelicans": "no",
  "New York Knicks": "ny",
  "Oklahoma City Thunder": "okc",
  "Orlando Magic": "orl",
  "Philadelphia 76ers": "phi",
  "Phoenix Suns": "phx",
  "Portland Trail Blazers": "por",
  "Sacramento Kings": "sac",
  "San Antonio Spurs": "sa",
  "Toronto Raptors": "tor",
  "Utah Jazz": "utah",
  "Washington Wizards": "wsh",
};

const METRICS = [
  {
    key: "points_per_36",
    label: "SCORING",
    unit: "PTS / 36",
    type: "number",
  },
  {
    key: "assists_per_36",
    label: "PLAYMAKING",
    unit: "AST / 36",
    type: "number",
  },
  {
    key: "turnovers_per_36",
    label: "TURNOVER PRODUCTION",
    unit: "TOV / 36",
    type: "number",
  },
  {
    key: "rebounds_per_36",
    label: "REBOUNDING",
    unit: "REB / 36",
    type: "number",
  },
  {
    key: "three_attempts_per_36",
    label: "THREE-POINT VOLUME",
    unit: "3PA / 36",
    type: "number",
  },
  {
    key: "true_shooting_pct",
    label: "SCORING EFFICIENCY",
    unit: "TRUE SHOOTING",
    type: "percent",
  },
  {
    key: "three_point_pct",
    label: "THREE-POINT ACCURACY",
    unit: "3P%",
    type: "percent",
  },
  {
    key: "steals_per_36",
    label: "STEAL PRODUCTION",
    unit: "STL / 36",
    type: "number",
  },
  {
    key: "blocks_per_36",
    label: "BLOCK PRODUCTION",
    unit: "BLK / 36",
    type: "number",
  },
];

function isNumber(value) {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

function formatNumber(value) {
  return isNumber(value)
    ? value.toFixed(1)
    : "—";
}

function formatPercent(value) {
  return isNumber(value)
    ? `${(value * 100).toFixed(1)}%`
    : "—";
}

function formatMetric(value, metric) {
  return metric.type === "percent"
    ? formatPercent(value)
    : formatNumber(value);
}

function getSeasonLabel(value) {
  if (!isNumber(value)) {
    return "NO SEASON DATA";
  }

  return `${value - 1}–${String(value).slice(-2)}`;
}

function getSampleLabel(player) {
  if (!isNumber(player?.historical_minutes)) {
    return "NO VERIFIED MINUTES";
  }

  return `${Math.round(
    player.historical_minutes
  ).toLocaleString()} HISTORICAL MIN`;
}

function getProfileMessage(player) {
  if (!player) return "";

  if (!player.historical_profile_available) {
    return (
      "No verified historical NBA profile " +
      "is available for this player."
    );
  }

  if (!player.historical_metrics_usable) {
    return (
      "A historical record exists, but usable " +
      "statistical metrics are unavailable."
    );
  }

  return (
    player.sample_warning ||
    "Historical statistical profile available."
  );
}

function getPlayerId(player) {
  return String(
    player?.athlete_key ||
    `${player?.team}::${player?.player}`
  );
}

function getTeamColor(team) {
  return TEAM_COLORS[team] || "#334155";
}

function initials(name) {
  return String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function TeamLogo({ team }) {
  const [failed, setFailed] = useState(false);
  const code = TEAM_CODES[team];

  useEffect(() => {
    setFailed(false);
  }, [team]);

  return (
    <div
      className="dna-team-logo"
      title={team}
      aria-label={`${team} logo`}
    >
      {code && !failed ? (
        <img
          src={`https://a.espncdn.com/i/teamlogos/nba/500/${code}.png`}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{initials(team)}</span>
      )}
    </div>
  );
}

/* NBA_DNA_PLAYER_PORTRAITS_V1 */
const PLAYER_DNA_PHOTOS_BY_ID = {
  "6442": "/images/players/espn_6442.png",
  "6606": "/images/players/espn_6606.png",
  "2991230": "/images/players/espn_2991230.png",
  "3136196": "/images/players/espn_3136196.png",
  "4396993": "/images/players/espn_4396993.png",
  "5101761": "/images/players/espn_5101761.png",
  "5095151": "/images/players/espn_5095151.png",
  "4873153": "/images/players/espn_4873153.png",
  "5175737": "/images/players/espn_5175737.png",
  "5041935": "/images/players/espn_5041935.png",
  "5142620": "/images/players/espn_5142620.png",
  "5041955": "/images/players/espn_5041955.png",
  "5142718": "/images/players/espn_5142718.png"
};

const PLAYER_DNA_PHOTOS_BY_NAME = {
  "Kyrie Irving": "/images/players/espn_6442.png",
  "Damian Lillard": "/images/players/espn_6606.png",
  "Fred VanVleet": "/images/players/espn_2991230.png",
  "Trey Lyles": "/images/players/espn_3136196.png",
  "Tyrese Haliburton": "/images/players/espn_4396993.png",
  "Mikel Brown": "/images/players/espn_5101761.png",
  "Caleb Wilson": "/images/players/espn_5095151.png",
  "Morez Johnson": "/images/players/espn_4873153.png",
  "Yaxel Lendeborg": "/images/players/espn_5175737.png",
  "Cameron Boozer": "/images/players/espn_5041935.png",
  "Darius Acuff": "/images/players/espn_5142620.png",
  "Darryn Peterson": "/images/players/espn_5041955.png",
  "AJ Dybantsa": "/images/players/espn_5142718.png"
};

function playerDnaPhotoUrl(player) {
  if (!player) return null;
  const id = String(player.athlete_key ?? '');
  return PLAYER_DNA_PHOTOS_BY_ID[id] ||
    PLAYER_DNA_PHOTOS_BY_NAME[player.player] ||
    player.headshot_url || null;
}

/* NBA_DNA_ROOKIE_PRESEASON_V3 */
const PRESEASON_ROOKIE_NAMES = new Set([
  "mikel brown", "caleb wilson", "morez johnson",
  "yaxel lendeborg", "cameron boozer", "darius acuff",
  "darryn peterson", "aj dybantsa"
]);

function RookiePreseasonCard({ player, compact = false }) {
  const [payload, setPayload] = useState(null);
  useEffect(() => {
    let active = true;
    fetch('/data/rookie_preseason_2026_27.json')
      .then((r) => {
        if (!r.ok) throw new Error('Preseason unavailable');
        return r.json();
      })
      .then((d) => { if (active) setPayload(d); })
      .catch(() => { if (active) setPayload(null); });
    return () => { active = false; };
  }, []);

  const name = String(player?.player ?? '').toLowerCase().trim();
  if (!PRESEASON_ROOKIE_NAMES.has(name)) return null;

  const id = String(player?.athlete_key ?? '');
  const row = payload?.summary?.find((x) =>
    String(x.athlete_id) === id ||
    String(x.player).toLowerCase().trim() === name
  );
  if (!row) return null;

  const stats = compact
    ? [['GP',row.GP],['PPG',row.PPG],['RPG',row.RPG],['APG',row.APG]]
    : [['GP',row.GP],['PPG',row.PPG],['RPG',row.RPG],
       ['APG',row.APG],['FG%',row.FG_pct],['3P%',row.TP_pct],
       ['FT%',row.FT_pct],['FGA',row.FGA],['3PA',row.TPA]];

  return (
    <section style={{padding:compact?12:18,marginTop:14,border:'1px solid #dfe5ea',background:'#f8fafc',borderRadius:4}}>
      <div style={{fontSize:11,fontWeight:800,letterSpacing:1.2,color:'#e66c45'}}>2026–27 PRESEASON / ROOKIE DNA</div>
      <div style={{display:'grid',gridTemplateColumns:compact?'repeat(2,minmax(0,1fr))':'repeat(3,minmax(0,1fr))',gap:10,marginTop:12}}>
        {stats.map(([label,value]) => (
          <div key={label} style={{borderTop:'1px solid #d8e0e7',paddingTop:8}}>
            <div style={{fontSize:10,color:'#7a8793',fontWeight:700}}>{label}</div>
            <div style={{fontSize:compact?18:24,color:'#17212b',fontWeight:800}}>{value ?? '—'}</div>
          </div>
        ))}
      </div>
      <p style={{fontSize:10,color:'#718096',marginTop:12,marginBottom:0}}>Preseason only · Shot locations unverified · Regular-season status pending verification</p>
    </section>
  );
}
function PlayerPortrait({
  player,
  compact = false,
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [
    player?.athlete_key,
    player?.headshot_url,
  ]);

  return (
    <div
      className={
        compact
          ? "player-dna-portrait player-dna-portrait-compact"
          : "player-dna-portrait"
      }
    >
      {playerDnaPhotoUrl(player) && !failed ? (
        <img
          src={playerDnaPhotoUrl(player)}
          alt={player.player}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="player-dna-portrait-fallback">
          {initials(player?.player) || "NBA"}
        </span>
      )}
    </div>
  );
}

function getPeerPercentile(
  player,
  metricKey,
  population
) {
  if (
    !player?.historical_metrics_usable ||
    !isNumber(player.historical_minutes) ||
    player.historical_minutes < 500 ||
    !isNumber(player[metricKey])
  ) {
    return null;
  }

  const values = population
    .filter(
      (item) =>
        item.historical_metrics_usable &&
        isNumber(item.historical_minutes) &&
        item.historical_minutes >= 500 &&
        isNumber(item[metricKey])
    )
    .map((item) => item[metricKey]);

  if (!values.length) return null;

  const value = player[metricKey];

  const below = values.filter(
    (item) => item < value
  ).length;

  const equal = values.filter(
    (item) => item === value
  ).length;

  return Math.round(
    (100 * (below + equal / 2)) /
      values.length
  );
}


// NBA_DNA_STAGE35_4F_SCOUTING_SNAPSHOT
function ScoutingSnapshot({ player, population }) {
  const definitions = [
    { key: "points_per_36", label: "SCORING", phrase: "scoring volume" },
    { key: "assists_per_36", label: "PLAYMAKING", phrase: "playmaking production" },
    { key: "rebounds_per_36", label: "REBOUNDING", phrase: "rebounding production" },
    { key: "three_attempts_per_36", label: "3PT VOLUME", phrase: "three-point volume" },
    { key: "true_shooting_pct", label: "EFFICIENCY", phrase: "scoring efficiency" },
    { key: "three_point_pct", label: "3PT ACCURACY", phrase: "three-point accuracy" },
    { key: "steals_per_36", label: "STEALS", phrase: "steal production" },
    { key: "blocks_per_36", label: "BLOCKS", phrase: "block production" },
  ];

  const eligible = Boolean(
    player?.historical_metrics_usable &&
    isNumber(player?.historical_minutes) &&
    player.historical_minutes >= 500
  );

  const ranked = eligible
    ? definitions
        .map((metric) => ({
          ...metric,
          percentile: getPeerPercentile(
            player, metric.key, population
          ),
        }))
        .filter((metric) => metric.percentile !== null)
        .sort((a, b) => b.percentile - a.percentile)
    : [];

  const top = ranked.slice(0, 3);
  const strengths = ranked.filter(
    (metric) => metric.percentile >= 75
  );

  const headline = !eligible || !ranked.length
    ? "EVIDENCE FIRST."
    : strengths.length >= 2
      ? "MULTIPLE STATISTICAL STRENGTHS."
      : strengths.length === 1
        ? "A CLEAR STATISTICAL STRENGTH."
        : "THE PROFILE IN CONTEXT.";

  const read = !eligible
    ? "Insufficient historical minutes or usable metrics for an eligible peer comparison."
    : !ranked.length
      ? "No eligible peer rankings are available for this historical profile."
      : strengths.length >= 2
        ? `Historical ${strengths[0].phrase} and ${strengths[1].phrase} rank in the upper quartile of eligible profiles.`
        : strengths.length === 1
          ? `Historical ${strengths[0].phrase} ranks in the upper quartile of eligible profiles. Other metrics provide additional context.`
          : "No measured category reaches the upper quartile of eligible historical profiles. Review the full statistical fingerprint for context.";

  return (
    <section className="dna-scouting-snapshot" aria-label="Historical scouting snapshot">
      <div className="dna-scouting-topline">
        <span>THE FRONT OFFICE / SCOUTING SNAPSHOT</span>
        <span className="dna-scouting-indicator" aria-hidden="true" />
      </div>

      <h4>{headline}</h4>
      <p className="dna-scouting-subtitle">
        HISTORICAL STATISTICAL PROFILE
      </p>

      <div className="dna-scouting-metrics">
        {top.length ? top.map((metric) => (
          <div className="dna-scouting-metric" key={metric.key}>
            <strong>P{metric.percentile}</strong>
            <span>{metric.label}</span>
          </div>
        )) : (
          <div className="dna-scouting-empty">
            NO ELIGIBLE PEER PERCENTILES
          </div>
        )}
      </div>

      <div className="dna-scouting-read">
        <strong>THE SCOUTING READ</strong>
        <p>{read}</p>
      </div>

      <p className="dna-scouting-method">
        Empirical peer percentiles · Minimum 500 historical
        minutes · Statistical indicators, not overall
        ability ratings or 2026–27 projections.
      </p>
    </section>
  );
}
function MetricBar({
  metric,
  player,
  population,
}) {
  const value = player[metric.key];

  const percentile = getPeerPercentile(
    player,
    metric.key,
    population
  );

  return (
    <div className="player-dna-metric">
      <div className="player-dna-metric-heading">
        <div>
          <span>{metric.label}</span>
          <small>{metric.unit}</small>
        </div>

        <strong>
          {formatMetric(value, metric)}
        </strong>
      </div>

      <div className="player-dna-track">
        <div
          className="player-dna-fill"
          style={{
            width: `${
              percentile === null
                ? 0
                : percentile
            }%`,
          }}
        />
      </div>

      <div className="dna-percentile-note">
        {percentile === null
          ? "NO PEER RANK"
          : `P${percentile} / ELIGIBLE HISTORICAL PROFILES`}
      </div>
    </div>
  );
}

function ComparisonIdentity({
  player,
  label,
  color,
}) {
  return (
    <div
      className="dna-comparison-identity"
      style={{
        "--comparison-color": color,
      }}
    >
      <div className="dna-comparison-identity-top">
        <span>{label}</span>
        <TeamLogo team={player.team} />
      </div>

      <PlayerPortrait
        player={player}
        compact
      />

      <div className="dna-comparison-identity-copy">
        <span className="dna-comparison-position">
          {player.primary_position || "ROTATION"}
        </span>

        <h4>{player.player}</h4>

        <p>{player.team}</p>

        <div className="dna-comparison-meta">
          <span>
            {getSeasonLabel(
              player.profile_season
            )}
          </span>

          <span>{getSampleLabel(player)}</span>
        </div>
      </div>
      <RookiePreseasonCard player={player} compact />
    </div>
  );
}

function ComparisonMetric({
  metric,
  playerA,
  playerB,
  population,
}) {
  const rankA = getPeerPercentile(
    playerA,
    metric.key,
    population
  );

  const rankB = getPeerPercentile(
    playerB,
    metric.key,
    population
  );

  return (
    <div className="dna-comparison-metric">
      <div className="dna-comparison-metric-title">
        <strong>{metric.label}</strong>
        <span>{metric.unit}</span>
      </div>

      <div className="dna-comparison-values">
        <div className="dna-comparison-value-a">
          <strong>
            {formatMetric(
              playerA[metric.key],
              metric
            )}
          </strong>

          <span>
            {rankA === null
              ? "NO PEER RANK"
              : `P${rankA}`}
          </span>
        </div>

        <div className="dna-comparison-value-b">
          <strong>
            {formatMetric(
              playerB[metric.key],
              metric
            )}
          </strong>

          <span>
            {rankB === null
              ? "NO PEER RANK"
              : `P${rankB}`}
          </span>
        </div>
      </div>

      <div className="dna-comparison-bars">
        <div className="dna-comparison-bar-a">
          <div
            style={{
              width: `${
                rankA === null ? 0 : rankA
              }%`,
            }}
          />
        </div>

        <div className="dna-comparison-bar-b">
          <div
            style={{
              width: `${
                rankB === null ? 0 : rankB
              }%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function PlayerDNA({
  team,
  teamColor = "#171717",
  selectedPlayerName = null,
  onPlayerSelect,
}) {
  const [allPlayers, setAllPlayers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // Comparison is visible by default.
  const [comparisonOpen, setComparisonOpen] =
    useState(true);

  const [comparisonTeam, setComparisonTeam] =
    useState("");

  const [comparisonId, setComparisonId] =
    useState("");

  // NBA_DNA_STAGE29C3_COMPARISON_RESET
  // A new primary player starts a fresh comparison.
  // Manual comparison choices remain intact while
  // the primary player and team stay unchanged.
  useEffect(() => {
    setComparisonTeam("");
    setComparisonId("");
  }, [selectedPlayerName, team]);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(DATA_URL);

        if (!response.ok) {
          throw new Error(
            `Player DNA data unavailable (${response.status}).`
          );
        }

        const result = await response.json();

        if (!Array.isArray(result)) {
          throw new Error(
            "Unexpected Player DNA data format."
          );
        }

        if (active) {
          setAllPlayers(result);
        }
      } catch (err) {
        if (active) {
          setError(
            err.message ||
            "Unable to load player data."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const teamPlayers = useMemo(
    () =>
      allPlayers.filter(
        (player) => player.team === team
      ),
    [allPlayers, team]
  );

  // Player A is controlled by App.jsx.
  const selectedPlayer = useMemo(
    () =>
      teamPlayers.find(
        (player) =>
          player.player === selectedPlayerName
      ) ||
      teamPlayers[0] ||
      null,
    [teamPlayers, selectedPlayerName]
  );

  const teams = useMemo(
    () =>
      [
        ...new Set(
          allPlayers.map(
            (player) => player.team
          )
        ),
      ].sort(),
    [allPlayers]
  );

  const effectiveComparisonTeam =
    comparisonTeam || team;

  const comparisonCandidates = useMemo(
    () =>
      allPlayers
        .filter(
          (player) =>
            player.team ===
            effectiveComparisonTeam
        )
        .sort(
          (a, b) =>
            a.player.localeCompare(b.player)
        ),
    [allPlayers, effectiveComparisonTeam]
  );

  // Player B is independent of the global selection.
  const comparisonPlayer = useMemo(() => {
    const requested = comparisonCandidates.find(
      (player) =>
        getPlayerId(player) === comparisonId
    );

    if (
      requested &&
      getPlayerId(requested) !==
        getPlayerId(selectedPlayer)
    ) {
      return requested;
    }

    return (
      comparisonCandidates.find(
        (player) =>
          getPlayerId(player) !==
          getPlayerId(selectedPlayer)
      ) ||
      null
    );
  }, [
    comparisonCandidates,
    comparisonId,
    selectedPlayer,
  ]);

  const eligibleCount = useMemo(
    () =>
      allPlayers.filter(
        (player) =>
          player.historical_metrics_usable &&
          isNumber(
            player.historical_minutes
          ) &&
          player.historical_minutes >= 500
      ).length,
    [allPlayers]
  );

  if (loading) {
    return (
      <section
        className="player-dna-section"
        id="player-dna"
      >
        <p className="player-dna-state">
          Loading player intelligence…
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section
        className="player-dna-section"
        id="player-dna"
      >
        <p className="player-dna-state">
          {error}
        </p>
      </section>
    );
  }

  if (!selectedPlayer) {
    return (
      <section
        className="player-dna-section"
        id="player-dna"
      >
        <p className="player-dna-state">
          No player profiles found for this team.
        </p>
      </section>
    );
  }

  const usable =
    selectedPlayer.historical_metrics_usable;

  return (
    <section
      className="player-dna-section"
      id="player-dna"
      style={{
        "--dna-accent": teamColor,
      }}
    >
      <div className="player-dna-heading">
        <div>
          <span className="player-dna-eyebrow">
            09 / PLAYER INTELLIGENCE
          </span>

          <h2>THE PLAYER DNA.</h2>

          <p>
            Beyond the rotation. A historical
            statistical fingerprint of the players
            shaping tomorrow's NBA.
          </p>
        </div>

        <div className="player-dna-heading-index">
          <strong>270</strong>
          <span>PROJECTED PLAYERS</span>
        </div>
      </div>

      <div className="player-dna-selector">
        <div className="player-dna-selector-heading">
          <span>SELECT PLAYER A</span>
          <span>{team.toUpperCase()}</span>
        </div>

        <div className="player-dna-player-list">
          {teamPlayers.map((player) => (
            <button
              key={getPlayerId(player)}
              type="button"
              className={
                "player-dna-player-button" +
                (getPlayerId(selectedPlayer) ===
                getPlayerId(player)
                  ? " is-active"
                  : "")
              }
              onClick={() =>
                onPlayerSelect?.(player)
              }
              aria-pressed={
                getPlayerId(selectedPlayer) ===
                getPlayerId(player)
              }
            >
              <span className="player-dna-button-name">
                {player.player}
              </span>

              <span className="player-dna-button-position">
                {player.primary_position || "—"}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="player-dna-main">
        <div className="player-dna-identity">
          <div className="player-dna-identity-top">
            <span>
              PLAYER PROFILE / {team.toUpperCase()}
            </span>

            <TeamLogo team={team} />
          </div>

          <PlayerPortrait
            player={selectedPlayer}
          />

          <div className="player-dna-name-block">
            <span className="player-dna-position">
              {selectedPlayer.primary_position ||
                "POSITION N/A"}
            </span>

            <h3>{selectedPlayer.player}</h3>

            <p>
              {selectedPlayer.projected_starter
                ? "PROJECTED STARTER"
                : "PROJECTED ROTATION"}
              {" / "}
              {formatNumber(
                selectedPlayer.projected_mpg
              )}
              {" PROJECTED MPG"}
            </p>
          </div>

          <ScoutingSnapshot
            player={selectedPlayer}
            population={allPlayers}
          />

          <RookiePreseasonCard player={selectedPlayer} />

          <div className="player-dna-identity-footer">
            <div>
              <span>HISTORICAL SEASON</span>

              <strong>
                {getSeasonLabel(
                  selectedPlayer.profile_season
                )}
              </strong>
            </div>

            <div>
              <span>SAMPLE</span>

              <strong>
                {getSampleLabel(
                  selectedPlayer
                )}
              </strong>
            </div>
          </div>
        </div>

        <div className="player-dna-analysis">
          <div className="player-dna-analysis-header">
            <div>
              <span>
                THE STATISTICAL FINGERPRINT
              </span>

              <h3>
                Production. Creation. Efficiency.
              </h3>
            </div>

            <span className="player-dna-sample-tag">
              {selectedPlayer.sample_tier ||
                "UNKNOWN SAMPLE"}
            </span>
          </div>

          {usable ? (
            <>
              <div className="player-dna-feature-stats">
                <div>
                  <span>POINTS / 36</span>

                  <strong>
                    {formatNumber(
                      selectedPlayer.points_per_36
                    )}
                  </strong>
                </div>

                <div>
                  <span>ASSISTS / 36</span>

                  <strong>
                    {formatNumber(
                      selectedPlayer.assists_per_36
                    )}
                  </strong>
                </div>

                <div>
                  <span>TRUE SHOOTING</span>

                  <strong>
                    {formatPercent(
                      selectedPlayer.true_shooting_pct
                    )}
                  </strong>
                </div>
              </div>

              <div className="player-dna-metric-list">
                {METRICS.map((metric) => (
                  <MetricBar
                    key={metric.key}
                    metric={metric}
                    player={selectedPlayer}
                    population={allPlayers}
                  />
                ))}
              </div>

              <div className="player-dna-shooting">
                <div>
                  <span>
                    THREE-POINT ACCURACY
                  </span>

                  <strong>
                    {formatPercent(
                      selectedPlayer.three_point_pct
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    THREE-POINT ATTEMPT RATE
                  </span>

                  <strong>
                    {formatPercent(
                      selectedPlayer.three_point_attempt_rate
                    )}
                  </strong>
                </div>
              </div>
            </>
          ) : (
            <div className="player-dna-unavailable">
              <span>
                INSUFFICIENT HISTORICAL EVIDENCE
              </span>

              <h4>
                No statistical fingerprint available.
              </h4>

              <p>
                This player remains part of the
                projected rotation, but historical
                production cannot be presented
                responsibly from the current dataset.
              </p>
            </div>
          )}

          <div className="player-dna-disclaimer">
            <span className="player-dna-disclaimer-icon">
              i
            </span>

            <p>
              {getProfileMessage(selectedPlayer)}
              {" "}
              Historical rates describe observed
              performance, not projected 2026–27
              production. Bars show empirical
              percentiles against eligible historical
              profiles with at least 500 recorded
              minutes and an available metric.
              Small samples do not receive peer
              ranks. Steals and blocks do not
              measure overall defensive quality.
              A higher turnover percentile means
              more recorded turnovers, not
              necessarily better performance.
            </p>
          </div>
        </div>
      </div>

      <div className="dna-comparison-section">
        <div className="dna-comparison-intro">
          <div>
            <span className="dna-comparison-kicker">
              THE NEXT LAYER / PLAYER INTELLIGENCE
            </span>

            <h3>THE DNA COMPARISON.</h3>

            <p>
              Two players. Two team identities.
              One evidence-based statistical
              comparison across the league.
            </p>
          </div>

          <button
            type="button"
            className="dna-comparison-toggle"
            onClick={() =>
              setComparisonOpen((open) => !open)
            }
            aria-expanded={comparisonOpen}
          >
            {comparisonOpen
              ? "CLOSE COMPARISON −"
              : "COMPARE PLAYERS ↗"}
          </button>
        </div>

        {comparisonOpen && (
          <div className="dna-comparison-content">
            <div className="dna-comparison-controls">
              <div className="dna-comparison-control">
                <label>
                  PLAYER A / SYNCHRONIZED
                </label>

                <div className="dna-comparison-fixed">
                  <span>{selectedPlayer.player}</span>
                  <small>{selectedPlayer.team}</small>
                </div>
              </div>

              <div className="dna-comparison-control">
                <label htmlFor="dna-compare-team">
                  PLAYER B / TEAM
                </label>

                <select
                  id="dna-compare-team"
                  value={effectiveComparisonTeam}
                  onChange={(event) => {
                    setComparisonTeam(
                      event.target.value
                    );
                    setComparisonId("");
                  }}
                >
                  {teams.map((name) => (
                    <option
                      key={name}
                      value={name}
                    >
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="dna-comparison-control">
                <label htmlFor="dna-compare-player">
                  PLAYER B / PLAYER
                </label>

                <select
                  id="dna-compare-player"
                  value={
                    comparisonPlayer
                      ? getPlayerId(
                          comparisonPlayer
                        )
                      : ""
                  }
                  onChange={(event) =>
                    setComparisonId(
                      event.target.value
                    )
                  }
                >
                  {comparisonCandidates
                    .filter(
                      (player) =>
                        getPlayerId(player) !==
                        getPlayerId(
                          selectedPlayer
                        )
                    )
                    .map((player) => (
                      <option
                        key={getPlayerId(player)}
                        value={getPlayerId(player)}
                      >
                        {player.player}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {comparisonPlayer ? (
              <>
                <div
                  className="dna-comparison-matchup"
                  style={{
                    "--comparison-a":
                      getTeamColor(
                        selectedPlayer.team
                      ),
                    "--comparison-b":
                      getTeamColor(
                        comparisonPlayer.team
                      ),
                  }}
                >
                  <ComparisonIdentity
                    player={selectedPlayer}
                    label="PLAYER A / ACTIVE SELECTION"
                    color={getTeamColor(
                      selectedPlayer.team
                    )}
                  />

                  <div className="dna-comparison-versus">
                    VS
                  </div>

                  <ComparisonIdentity
                    player={comparisonPlayer}
                    label="PLAYER B / COMPARISON"
                    color={getTeamColor(
                      comparisonPlayer.team
                    )}
                  />
                </div>

                <div
                  className="dna-comparison-results"
                  style={{
                    "--comparison-a":
                      getTeamColor(
                        selectedPlayer.team
                      ),
                    "--comparison-b":
                      getTeamColor(
                        comparisonPlayer.team
                      ),
                  }}
                >
                  <div className="dna-comparison-results-header">
                    <div>
                      <span>
                        HISTORICAL STATISTICAL MATCHUP
                      </span>

                      <h4>
                        The numbers behind the names.
                      </h4>
                    </div>

                    <span>
                      {eligibleCount} ELIGIBLE PROFILES
                    </span>
                  </div>

                  {METRICS.map((metric) => (
                    <ComparisonMetric
                      key={metric.key}
                      metric={metric}
                      playerA={selectedPlayer}
                      playerB={comparisonPlayer}
                      population={allPlayers}
                    />
                  ))}

                  <div className="dna-comparison-methodology">
                    <strong>
                      HOW TO READ THIS COMPARISON
                    </strong>

                    <p>
                      The numbers are observed
                      historical statistics, not
                      forecasts. Bar lengths represent
                      empirical midrank percentiles,
                      calculated separately for each
                      metric among verified profiles
                      with at least 500 historical
                      minutes and a valid value.
                      A higher percentile means a
                      higher recorded value, not
                      necessarily better basketball
                      performance. Historical seasons
                      and sample sizes may differ.
                      Missing data and samples below
                      500 minutes have no peer rank.
                    </p>

                    <p>
                      Player A is synchronized with
                      The Living Court and The Absence
                      Ripple. Player B is comparison
                      only and does not change the
                      active team or absence scenario.
                    </p>
                  </div>
                </div>

                {/* THE MATCHUP REPORT
                    Uses the same verified historical
                    records as the comparison above. */}
                <MatchupReport
                  playerA={selectedPlayer}
                  playerB={comparisonPlayer}
                />
              </>
            ) : (
              <div className="player-dna-state">
                Choose a different player to compare.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="player-dna-bottom-line">
        <span>
          NBA DNA LAB / THE FRONT OFFICE
        </span>

        <span>
          HISTORICAL EVIDENCE × PROJECTED ROLE
        </span>
      </div>
    </section>
  );
}