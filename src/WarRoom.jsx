
import { useEffect, useMemo, useState } from "react";
import "./WarRoom.css";
import WarRoomAbsence from "./WarRoomAbsence"; // NBA_DNA_STAGE33_4B

// NBA_DNA_STAGE33_4

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
  "Washington Wizards": "wsh"
};



// NBA_DNA_STAGE33_4A_SAFE

const WAR_ROOM_SCENARIOS = [
  {
    id: "ROTATION",
    number: "01",
    name: "Rotation Priority",
    question: "Who gets your priority?",
    description:
      "Compare three projected rotation players. Select the profile you would prioritize for your franchise.",
    board: "Evaluate your options.",
    decision: "Make the call."
  },
  {
    id: "ABSENCE",
    number: "02",
    name: "Injury Response",
    question: "Who is your contingency option?",
    description:
      "Imagine the rotation must adapt to an unavailable player. Choose a candidate for additional personnel review. This selection does not calculate redistributed minutes.",
    board: "Review contingency candidates.",
    decision: "Nominate your contingency."
  },
  {
    id: "SCOUTING",
    number: "03",
    name: "Scouting Decision",
    question: "Which profile fits your objective?",
    description:
      "Set your statistical priority and shortlist the player whose available evidence best supports your scouting objective.",
    board: "Compare scouting profiles.",
    decision: "File your scouting choice."
  }
];

const PRIORITIES = [
  {
    id: "SCORING_EFFICIENCY",
    label: "Scoring efficiency",
    metric: "true_shooting_pct",
    unit: "TS%",
    note: "True Shooting % captures scoring efficiency across field goals and free throws. It does not measure scoring volume."
  },
  {
    id: "PLAYMAKING",
    label: "Playmaking",
    metric: "assists_per_36",
    unit: "AST / 36",
    note: "Assists per 36 normalize recorded assists for playing time. They do not capture every form of shot creation."
  },
  {
    id: "REBOUNDING",
    label: "Rebounding",
    metric: "rebounds_per_36",
    unit: "REB / 36",
    note: "Rebounds per 36 measure recorded rebounding production standardized for minutes."
  },
  {
    id: "DEFENSIVE_ACTIVITY",
    label: "Defensive activity",
    metric: "stocks",
    unit: "STL + BLK / 36",
    note: "Steals and blocks are observable defensive events, not a complete measure of defensive impact."
  },
  {
    id: "ROLE_AND_MINUTES",
    label: "Projected role",
    metric: "projected_mpg",
    unit: "PROJECTED MPG",
    note: "Projected minutes describe expected 2026–27 playing time. They are not a measure of player quality."
  }
];

const SCOUTING_METRICS = [
  {
    key: "points_per_36",
    label: "POINTS / 36",
    higher: true
  },
  {
    key: "assists_per_36",
    label: "ASSISTS / 36",
    higher: true
  },
  {
    key: "rebounds_per_36",
    label: "REBOUNDS / 36",
    higher: true
  },
  {
    key: "turnovers_per_36",
    label: "TURNOVERS / 36",
    higher: false
  },
  {
    key: "true_shooting_pct",
    label: "TRUE SHOOTING",
    higher: true
  },
  {
    key: "three_point_pct",
    label: "3PT %",
    higher: true
  },
  {
    key: "three_attempts_per_36",
    label: "3PA / 36",
    higher: true
  },
  {
    key: "stocks",
    label: "STL + BLK / 36",
    higher: true
  }
];

function numberOrNull(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function getMetric(player, metric) {
  if (!player) return null;

  if (
    metric !== "projected_mpg" &&
    !player.historical_profile_usable
  ) {
    return null;
  }

  if (metric === "stocks") {
    const steals = numberOrNull(
      player.steals_per_36
    );

    const blocks = numberOrNull(
      player.blocks_per_36
    );

    return steals === null || blocks === null
      ? null
      : steals + blocks;
  }

  return numberOrNull(player[metric]);
}

function formatMetric(value, metric) {
  if (value === null) return "N/A";

  if (
    metric === "true_shooting_pct" ||
    metric === "three_point_pct"
  ) {
    return `${(value * 100).toFixed(1)}%`;
  }

  return value.toFixed(1);
}

function playerKey(player) {
  return String(player.athlete_key);
}

function rankedMetrics(player, candidates) {
  if (!player) return [];

  return SCOUTING_METRICS.map((metric) => {
    const value = getMetric(player, metric.key);

    const available = candidates
      .map((candidate) => ({
        player: candidate,
        value: getMetric(candidate, metric.key)
      }))
      .filter((entry) => entry.value !== null);

    if (value === null || available.length < 2) {
      return {
        ...metric,
        value,
        comparison: "insufficient",
        available: available.length
      };
    }

    const values = available.map(
      (entry) => entry.value
    );

    const best = metric.higher
      ? Math.max(...values)
      : Math.min(...values);

    const worst = metric.higher
      ? Math.min(...values)
      : Math.max(...values);

    const tolerance = 0.000001;

    let comparison = "middle";

    if (Math.abs(value - best) < tolerance) {
      comparison = "leading";
    } else if (
      Math.abs(value - worst) < tolerance
    ) {
      comparison = "trailing";
    }

    return {
      ...metric,
      value,
      comparison,
      available: available.length
    };
  });
}

function Portrait({ player }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [player.athlete_key, player.headshot_url]);

  const sources = [
    ...new Set([
      player.athlete_key
        ? `/images/players/espn_${player.athlete_key}.png`
        : null,
      player.headshot_url
    ].filter(Boolean))
  ];

  const source = sources[index];

  return (
    <div className="wr-portrait">
      {source ? (
        <img
          src={source}
          alt={player.player}
          loading="lazy"
          onError={() => {
            setIndex((value) => value + 1);
          }}
        />
      ) : (
        <div className="wr-portrait-fallback">
          {player.player
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")}
        </div>
      )}
    </div>
  );
}

function Candidate({
  player,
  index,
  active,
  onSelect,
  priority,
  candidates
}) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [player.athlete_key]);

  const priorityValue = getMetric(
    player,
    priority.metric
  );

  const scouting = rankedMetrics(
    player,
    candidates
  );

  const strengths = scouting.filter(
    (metric) => metric.comparison === "leading"
  );

  const watchouts = scouting.filter(
    (metric) => metric.comparison === "trailing"
  );

  return (
    <article
      className={`wr-candidate ${
        active ? "wr-candidate-active" : ""
      }`}
    >
      <div className="wr-candidate-index">
        <span>PERSONNEL FILE / 0{index + 1}</span>
        <span>{player.position || "—"}</span>
      </div>

      <Portrait player={player} />

      <div className="wr-candidate-body">
        <h4>{player.player}</h4>

        <div className="wr-role">
          {player.projected_starter
            ? "PROJECTED STARTER"
            : "PROJECTED ROTATION"}
        </div>

        <div className="wr-stats">
          <div>
            <small>PROJECTED MPG</small>
            <strong>
              {formatMetric(
                numberOrNull(player.projected_mpg),
                "projected_mpg"
              )}
            </strong>
          </div>

          <div>
            <small>{priority.unit}</small>
            <strong>
              {formatMetric(
                priorityValue,
                priority.metric
              )}
            </strong>
          </div>
        </div>

        <p className="wr-availability">
          {player.historical_profile_usable
            ? `${player.historical_games ?? "—"} historical games · 2025–26`
            : "2025–26 historical profile unavailable"}
        </p>

        {player.sample_warning && (
          <p className="wr-warning">
            {player.sample_warning}
          </p>
        )}

        <button
          type="button"
          className="wr-expand"
          onClick={() =>
            setExpanded((value) => !value)
          }
          aria-expanded={expanded}
        >
          {expanded
            ? "CLOSE SCOUTING FILE"
            : "OPEN SCOUTING FILE"}
          <span>{expanded ? "−" : "+"}</span>
        </button>

        {expanded && (
          <div className="wr-scouting">
            <div className="wr-scouting-title">
              HISTORICAL PRODUCTION / 2025–26
            </div>

            <div className="wr-scouting-grid">
              {scouting.map((metric) => (
                <div
                  key={metric.key}
                  className="wr-scouting-stat"
                >
                  <small>{metric.label}</small>

                  <strong>
                    {formatMetric(
                      metric.value,
                      metric.key
                    )}
                  </strong>

                  <span
                    className={
                      metric.comparison === "leading"
                        ? "wr-stat-leading"
                        : ""
                    }
                  >
                    {metric.comparison === "leading"
                      ? "TOP AVAILABLE / 3"
                      : metric.comparison === "trailing"
                      ? "LOWEST RELATIVE VALUE"
                      : metric.comparison === "middle"
                      ? "BETWEEN AVAILABLE VALUES"
                      : "COMPARISON LIMITED"}
                  </span>
                </div>
              ))}
            </div>

            <div className="wr-scouting-notes">
              <div>
                <strong>RELATIVE STRENGTHS</strong>

                <p>
                  {strengths.length
                    ? strengths
                        .slice(0, 3)
                        .map((metric) => metric.label)
                        .join(" · ")
                    : "No clear lead among comparable metrics."}
                </p>
              </div>

              <div>
                <strong>AREAS TO EVALUATE</strong>

                <p>
                  {watchouts.length
                    ? watchouts
                        .slice(0, 3)
                        .map((metric) => metric.label)
                        .join(" · ")
                    : "No clear trailing metric among available comparisons."}
                </p>
              </div>
            </div>

            <p className="wr-scouting-disclaimer">
              These labels compare only the
              three available candidates. They
              are not league-wide rankings or
              complete scouting grades.
              A lower turnover total, for example,
              does not account for ball-handling
              responsibility.
            </p>
          </div>
        )}

        <button
          type="button"
          className={`wr-pick ${
            active ? "wr-pick-active" : ""
          }`}
          onClick={onSelect}
          aria-pressed={active}
        >
          {active
            ? "SELECTED FOR REVIEW"
            : "SELECT THIS PLAYER"}
          <span>{active ? "✓" : "↗"}</span>
        </button>
      </div>
    </article>
  );
}



// ============================================================
// NBA_DNA_STAGE33_5C — ROTATION DECISION LAB
// ============================================================

const ROTATION_SCENARIOS = [
  {
    id: "FULL_ROLE",
    label: "Full role",
    description: "Original projected minutes"
  },
  {
    id: "HALF_ROLE",
    label: "Half role",
    description: "Reduced playing time"
  },
  {
    id: "UNAVAILABLE",
    label: "Unavailable",
    description: "Player removed from rotation"
  }
];

function RotationDecisionLab({
  team,
  candidates,
  selectedPlayer
}) {
  const [records, setRecords] = useState(null);
  const [summaries, setSummaries] = useState(null);
  const [error, setError] = useState("");
  const [target, setTarget] = useState("");
  const [scenario, setScenario] = useState("HALF_ROLE");

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      fetch(
        "/data/front_office_universal_players_19gd.json",
        { signal: controller.signal }
      ),
      fetch(
        "/data/front_office_universal_summary_19gd.json",
        { signal: controller.signal }
      )
    ])
      .then(async (responses) => {
        if (responses.some((response) => !response.ok)) {
          throw new Error("Rotation model data unavailable.");
        }

        return Promise.all(
          responses.map((response) => response.json())
        );
      })
      .then(([playerRows, summaryRows]) => {
        if (
          !Array.isArray(playerRows) ||
          !Array.isArray(summaryRows)
        ) {
          throw new Error("Invalid rotation model structure.");
        }

        setRecords(playerRows);
        setSummaries(summaryRows);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    setTarget("");
    setScenario("HALF_ROLE");
  }, [team]);

  useEffect(() => {
    if (
      selectedPlayer &&
      candidates.some(
        (item) => item.player === selectedPlayer.player
      )
    ) {
      setTarget(selectedPlayer.player);
    }
  }, [selectedPlayer, candidates]);

  const availableTargets = useMemo(() => {
    if (!summaries) return [];

    return [
      ...new Set(
        summaries
          .filter((row) => row.team === team)
          .map((row) => row.target_player)
      )
    ];
  }, [summaries, team]);

  const activeTarget =
    target && availableTargets.includes(target)
      ? target
      : availableTargets[0] || "";

  const result = useMemo(() => {
    if (!summaries) return null;

    return summaries.find(
      (row) =>
        row.team === team &&
        row.target_player === activeTarget &&
        row.scenario === scenario
    ) || null;
  }, [summaries, team, activeTarget, scenario]);

  const rows = useMemo(() => {
    if (!records) return [];

    return records
      .filter(
        (row) =>
          row.team === team &&
          row.target_player === activeTarget &&
          row.scenario === scenario
      )
      .sort(
        (a, b) =>
          Number(b.baseline_mpg) -
          Number(a.baseline_mpg)
      );
  }, [records, team, activeTarget, scenario]);

  const recipients = rows
    .filter(
      (row) =>
        !row.target_flag &&
        Number(row.added_mpg) > 0
    )
    .sort(
      (a, b) =>
        Number(b.added_mpg) -
        Number(a.added_mpg)
    );

  const format = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n.toFixed(1) : "N/A";
  };

  const removed = Number(result?.minutes_removed || 0);
  const redistributed = Number(
    result?.minutes_redistributed || 0
  );
  const unallocated = Number(
    result?.minutes_unallocated || 0
  );

  const largestBaseline = Math.max(
    1,
    ...rows.map(
      (row) => Number(row.baseline_mpg) || 0
    ),
    ...rows.map(
      (row) => Number(row.scenario_mpg) || 0
    )
  );

  return (
    <div className="wr-rotation-lab">
      <div className="wr-rotation-heading">
        <span className="wr-eyebrow">
          14 / ROTATION DECISION LAB
        </span>

        <h3>What happens to the minutes?</h3>

        <p>
          Explore a hypothetical change in one
          player's projected role. See how the
          existing model distributes available
          minutes across the rotation.
        </p>
      </div>

      {error && (
        <p className="wr-message" role="alert">
          {error}
        </p>
      )}

      {!records && !error && (
        <p className="wr-message">
          LOADING ROTATION MODEL...
        </p>
      )}

      {records && summaries && (
        <>
          <div className="wr-rotation-controls">
            <div>
              <label htmlFor="wr-target">
                PLAYER TO EVALUATE
              </label>

              <select
                id="wr-target"
                value={activeTarget}
                onChange={(event) =>
                  setTarget(event.target.value)
                }
              >
                {availableTargets.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="wr-rotation-label">
                SCENARIO
              </span>

              <div className="wr-scenario-buttons">
                {ROTATION_SCENARIOS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={scenario === item.id}
                    className={
                      scenario === item.id
                        ? "wr-scenario-active"
                        : ""
                    }
                    onClick={() => setScenario(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {result ? (
            <>
              <div className="wr-rotation-kpis">
                <div>
                  <small>MINUTES REMOVED</small>
                  <strong>{format(removed)}</strong>
                </div>

                <div>
                  <small>REDISTRIBUTED</small>
                  <strong>{format(redistributed)}</strong>
                </div>

                <div>
                  <small>UNALLOCATED</small>
                  <strong>{format(unallocated)}</strong>
                </div>
              </div>

              {unallocated > 0.01 && (
                <p className="wr-rotation-alert">
                  <strong>MODEL CAPACITY LIMIT:</strong>{" "}
                  {format(unallocated)} minutes remain
                  unallocated under this scenario.
                  The model does not force them
                  onto another player.
                </p>
              )}

              <div className="wr-rotation-chart-head">
                <h4>Projected rotation impact</h4>

                <div className="wr-rotation-legend">
                  <span>
                    <i className="wr-legend-baseline" />
                    Baseline
                  </span>
                  <span>
                    <i className="wr-legend-scenario" />
                    Scenario
                  </span>
                </div>
              </div>

              <div className="wr-rotation-chart">
                {rows.map((row) => {
                  const baseline = Number(
                    row.baseline_mpg
                  ) || 0;

                  const adjusted = Number(
                    row.scenario_mpg
                  ) || 0;

                  return (
                    <div
                      className="wr-rotation-player"
                      key={row.player}
                    >
                      <div className="wr-rotation-player-name">
                        <strong>{row.player}</strong>

                        {row.target_flag && (
                          <span>TARGET</span>
                        )}
                      </div>

                      <div className="wr-rotation-bars">
                        <div className="wr-rotation-track">
                          <div
                            className="wr-rotation-bar-baseline"
                            style={{
                              width: `${
                                (baseline / largestBaseline) *
                                100
                              }%`
                            }}
                          />
                        </div>

                        <div className="wr-rotation-track">
                          <div
                            className="wr-rotation-bar-scenario"
                            style={{
                              width: `${
                                (adjusted / largestBaseline) *
                                100
                              }%`
                            }}
                          />
                        </div>
                      </div>

                      <div className="wr-rotation-values">
                        <span>{format(baseline)}</span>
                        <strong>{format(adjusted)}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="wr-rotation-recipients">
                <span className="wr-eyebrow">
                  MINUTES ABSORBED BY TEAMMATES
                </span>

                {recipients.length ? (
                  <div className="wr-recipient-list">
                    {recipients.map((row) => (
                      <div key={row.player}>
                        <span>{row.player}</span>
                        <strong>
                          +{format(row.added_mpg)} MPG
                        </strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>
                    No teammates receive additional
                    minutes in this scenario.
                  </p>
                )}
              </div>

              <div className="wr-rotation-method">
                <strong>HOW TO READ THIS MODEL</strong>

                <p>
                  Baseline and scenario values are
                  modeled minutes per game, not
                  historical game logs. FULL_ROLE
                  retains the original projected
                  role; HALF_ROLE reduces the
                  target's minutes; UNAVAILABLE
                  removes the target from the
                  modeled rotation.
                </p>

                <p>
                  The model redistributes minutes
                  only where its assumptions
                  permit. Unallocated minutes are
                  displayed rather than hidden.
                  This is a hypothetical
                  rotation exercise, not a
                  prediction of points, assists,
                  wins or actual coaching decisions.
                </p>

                <p>
                  Source: Universal Rotation Model
                  19G-D. Reconciliation error:{" "}
                  {format(result.reconciliation_error)}.
                </p>
              </div>
            </>
          ) : (
            <p className="wr-message">
              No model result is available for
              this selection.
            </p>
          )}
        </>
      )}
    </div>
  );
}


export default function WarRoom({
  team,
  teamColor
}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [priorityId, setPriorityId] = useState(
    PRIORITIES[0].id
  );
  const [scenarioId, setScenarioId] = useState("ROTATION");
  const [playerId, setPlayerId] = useState("");
  const [committed, setCommitted] = useState(false);
  const [methodOpen, setMethodOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch(
      "/data/front_office_war_room_33_2.json",
      { signal: controller.signal }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Personnel data could not be loaded."
          );
        }

        return response.json();
      })
      .then(setData)
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    setPlayerId("");
    setPriorityId(PRIORITIES[0].id);
    setCommitted(false);
    setLogoFailed(false);
  }, [team]);

  useEffect(() => {
    setCommitted(false);
  }, [priorityId, playerId]);

  const caseFile = useMemo(
    () => data?.cases?.find(
      (item) => item.team === team
    ),
    [data, team]
  );

  const priority =
    PRIORITIES.find(
      (item) => item.id === priorityId
    ) || PRIORITIES[0];

  const scenario =
    WAR_ROOM_SCENARIOS.find(
      (item) => item.id === scenarioId
    ) || WAR_ROOM_SCENARIOS[0];

  const candidates = caseFile?.candidates || [];

  const selected = candidates.find(
    (item) =>
      playerKey(item) === playerId
  );

  const selectedValue = getMetric(
    selected,
    priority.metric
  );

  const available = candidates
    .map((player) => ({
      player,
      value: getMetric(
        player,
        priority.metric
      )
    }))
    .filter((item) => item.value !== null);

  const highest = available.length
    ? Math.max(
        ...available.map((item) => item.value)
      )
    : null;

  const selectedRanks = selected
    ? rankedMetrics(selected, candidates)
    : [];

  const strengths = selectedRanks.filter(
    (metric) => metric.comparison === "leading"
  );

  const watchouts = selectedRanks.filter(
    (metric) => metric.comparison === "trailing"
  );

  const alternative = available
    .filter(
      (item) =>
        !selected ||
        playerKey(item.player) !==
          playerKey(selected)
    )
    .sort(
      (a, b) => b.value - a.value
    )[0];

  const logoCode = TEAM_CODES[team];

  return (
    <section
      id="the-war-room"
      className={`wr-section wr-mode-${scenarioId.toLowerCase()}`}
      style={{
        "--wr-accent": teamColor || "#173F61"
      }}
    >
      <div className="wr-container">
        <div className="wr-intro">
          <span className="wr-eyebrow">
            THE FRONT OFFICE / PERSONNEL OPERATIONS
          </span>

          <h2>
            THE WAR ROOM<span>.</span>
          </h2>

          <p>
            Three candidates. Five priorities.
            One decision backed by evidence.
          </p>
        </div>

        {error && (
          <p role="alert" className="wr-message">
            {error}
          </p>
        )}

        {!data && !error && (
          <p className="wr-message">
            OPENING PERSONNEL FILES...
          </p>
        )}

        {data && !caseFile && (
          <p className="wr-message">
            No personnel file found for {team}.
          </p>
        )}

        {caseFile && (
          <div className="wr-paper">
            <header className="wr-header">
              <div className="wr-header-title">
                <span className="wr-eyebrow">
                  GENERAL MANAGER'S OFFICE /{" "}
                  {caseFile.case_id}
                </span>

                <h3>{team}</h3>

                <p>
                  2026–27 PROJECTED ROSTER REVIEW
                </p>
              </div>

              {logoCode && !logoFailed && (
                <img
                  className="wr-logo"
                  src={
                    `https://a.espncdn.com/i/teamlogos/nba/500/${logoCode}.png`
                  }
                  alt={`${team} logo`}
                  onError={() =>
                    setLogoFailed(true)
                  }
                />
              )}
            </header>

            <div className="wr-team-rule" />


            <div className="wr-scenario-panel">
              <div className="wr-scenario-label">
                <span className="wr-eyebrow">
                  GENERAL MANAGER ASSIGNMENTS
                </span>
                <span>03 DECISIONS</span>
              </div>

              <div
                className="wr-scenario-tabs"
                role="group"
                aria-label="GM scenarios"
              >
                {WAR_ROOM_SCENARIOS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={
                      scenarioId === item.id
                        ? "wr-scenario-selected"
                        : ""
                    }
                    aria-pressed={scenarioId === item.id}
                    onClick={() => {
                      setScenarioId(item.id);
                      setPlayerId("");
                      setCommitted(false);
                    }}
                  >
                    <small>{item.number}</small>
                    <strong>{item.name}</strong>
                  </button>
                ))}
              </div>
            </div>

            <div className="wr-brief">
              <span className="wr-eyebrow">
                01 / THE ASSIGNMENT
              </span>

              <div>
                <h3>{scenario.question}</h3>

                <p>{scenario.description}</p>
              </div>
            </div>

            <div className="wr-context">
              <span>
                {caseFile.roster_context
                  ?.rotation_players ?? "—"}{" "}
                ROTATION PLAYERS
              </span>

              <span>
                {caseFile.roster_context
                  ?.projected_starters ?? "—"}{" "}
                PROJECTED STARTERS
              </span>

              <span>
                3 PERSONNEL FILES
              </span>
            </div>


            {scenarioId === "ABSENCE" && (
              <div className="wr-scenario-note">
                <strong>ROTATION MODEL CONNECTION</strong>
                <p>
                  This is a contingency personnel choice.
                  The separate Absence Ripple experiment
                  calculates hypothetical minute
                  redistribution using its own model.
                  Your selection here does not imply
                  those minutes have been reassigned.
                </p>
              </div>
            )}

            {scenarioId === "SCOUTING" && (
              <div className="wr-scenario-note">
                <strong>SCOUTING CONTEXT</strong>
                <p>
                  Compare the available historical
                  statistics, projected roles and
                  sample limitations. A higher value
                  on one metric does not establish
                  overall player superiority.
                </p>
              </div>
            )}

            {/* NBA_DNA_STAGE33_4D_FINAL: use the existing RotationDecisionLab below */}

            <div className="wr-priorities">
              <span className="wr-eyebrow">
                02 / DEFINE YOUR PRIORITY
              </span>

              <h3>What matters most?</h3>

              <div className="wr-priority-list">
                {PRIORITIES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={
                      item.id === priorityId
                        ? "wr-priority-active"
                        : ""
                    }
                    aria-pressed={
                      item.id === priorityId
                    }
                    onClick={() =>
                      setPriorityId(item.id)
                    }
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <p className="wr-method-hint">
                <strong>{priority.unit}.</strong>{" "}
                {priority.note}
              </p>
            </div>

            <div className="wr-board-head">
              <div>
                <span className="wr-eyebrow">
                  03 / PERSONNEL BOARD
                </span>

                <h3>{scenario.board}</h3>
              </div>

              <span className="wr-board-instruction">
                OPEN FILES · SELECT ONE
              </span>
            </div>

            <div className="wr-board">
              {candidates.map(
                (player, index) => (
                  <Candidate
                    key={playerKey(player)}
                    player={player}
                    index={index}
                    candidates={candidates}
                    priority={priority}
                    active={
                      playerId ===
                      playerKey(player)
                    }
                    onSelect={() =>
                      setPlayerId(
                        playerKey(player)
                      )
                    }
                  />
                )
              )}
            </div>


            {/* NBA_DNA_STAGE33_4C */}
            <div className="wr-gm-context">
              <span className="wr-eyebrow">
                GM DECISION FRAMEWORK
              </span>

              {scenarioId === "ROTATION" && (
                <div>
                  <h4>Rotation Priority</h4>
                  <p>
                    Your decision identifies the
                    player you would prioritize
                    within the projected rotation.
                    Historical production can
                    support the recommendation,
                    but it does not establish
                    future playing time.
                  </p>
                </div>
              )}

              {scenarioId === "ABSENCE" && (
                <div>
                  <h4>Injury Response</h4>
                  <p>
                    Your personnel nomination
                    is separate from the modeled
                    absence scenario. Compare
                    your choice with the actual
                    calculated redistribution
                    below, including any
                    unallocated minutes.
                  </p>
                </div>
              )}

              {scenarioId === "SCOUTING" && (
                <div>
                  <h4>Scouting Decision</h4>
                  <p>
                    Your shortlist reflects a
                    statistical priority. Review
                    strengths, limitations and
                    alternative candidates before
                    interpreting the result as
                    a personnel recommendation.
                  </p>
                </div>
              )}
            </div>

            <div className="wr-decision">
              <span className="wr-eyebrow">
                04 / THE DECISION
              </span>

              <div className="wr-decision-row">
                <div>
                  <h3>{scenario.decision}</h3>

                  <p>
                    Choose a personnel priority.
                    This does not simulate a
                    transaction, contract,
                    or guaranteed outcome.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={!selected}
                  onClick={() =>
                    setCommitted(true)
                  }
                >
                  {committed
                    ? "DECISION FILED ✓"
                    : "FILE YOUR DECISION ↗"}
                </button>
              </div>
            </div>

            {committed && selected && scenarioId !== "ABSENCE" && (
              <div
                className="wr-report"
                aria-live="polite"
              >
                <span className="wr-eyebrow">
                  {scenarioId === "ROTATION"
                    ? "05 / GM ROTATION REVIEW"
                    : "05 / GM SCOUTING REPORT"}
                </span>

                <h3>{selected.player}</h3>

                <p>
                  Your decision prioritizes{" "}
                  <strong>
                    {priority.label.toLowerCase()}
                  </strong>.
                </p>

                <div className="wr-report-stats">
                  <div>
                    <small>
                      SELECTED PLAYER / {priority.unit}
                    </small>

                    <strong>
                      {formatMetric(
                        selectedValue,
                        priority.metric
                      )}
                    </strong>
                  </div>

                  <div>
                    <small>
                      HIGHEST AVAILABLE / THREE
                    </small>

                    <strong>
                      {formatMetric(
                        highest,
                        priority.metric
                      )}
                    </strong>
                  </div>
                </div>

                <p>
                  {selectedValue === null
                    ? "The selected metric is unavailable for this player. There is insufficient evidence for a direct comparison."
                    : available.length < 2
                    ? "There are not enough comparable values to evaluate the selection against another candidate."
                    : Math.abs(
                        selectedValue - highest
                      ) < 0.000001
                    ? "Your selection has the highest available value on this priority among these three candidates. This is not a complete player ranking."
                    : "Another candidate has a higher available value on your selected metric. A different role or team-building objective could still justify your choice."}
                </p>

                <div className="wr-report-details">
                  <div>
                    <span className="wr-eyebrow">
                      RELATIVE STRENGTHS
                    </span>

                    <p>
                      {strengths.length
                        ? strengths
                            .slice(0, 4)
                            .map(
                              (metric) =>
                                metric.label
                            )
                            .join(" · ")
                        : "No clear statistical lead among the available comparisons."}
                    </p>
                  </div>

                  <div>
                    <span className="wr-eyebrow">
                      AREAS TO EVALUATE
                    </span>

                    <p>
                      {watchouts.length
                        ? watchouts
                            .slice(0, 4)
                            .map(
                              (metric) =>
                                metric.label
                            )
                            .join(" · ")
                        : "No clear trailing metric among the available comparisons."}
                    </p>
                  </div>
                </div>

                {alternative &&
                  selectedValue !== null &&
                  alternative.value >
                    selectedValue && (
                    <div className="wr-alternative">
                      <span className="wr-eyebrow">
                        ALTERNATIVE TO CONSIDER
                      </span>

                      <p>
                        <strong>
                          {alternative.player.player}
                        </strong>{" "}
                        records{" "}
                        <strong>
                          {formatMetric(
                            alternative.value,
                            priority.metric
                          )}
                        </strong>{" "}
                        on this priority versus{" "}
                        <strong>
                          {formatMetric(
                            selectedValue,
                            priority.metric
                          )}
                        </strong>{" "}
                        for your selection.
                        This comparison does not
                        account for positional fit.
                      </p>
                    </div>
                  )}

                <div className="wr-analyst">
                  <strong>ANALYST'S NOTE</strong>

                  <p>
                    These observations use
                    available 2025–26 historical
                    production and separate
                    2026–27 projected roles.
                    Statistical leaders among
                    three candidates are not
                    necessarily the best players
                    or the best choices for
                    a particular roster.
                  </p>
                </div>

                <button
                  className="wr-reopen"
                  type="button"
                  onClick={() =>
                    setCommitted(false)
                  }
                >
                  REOPEN DECISION ↗
                </button>
              </div>
            )}


            {committed && selected && scenarioId === "ABSENCE" && (
              <div className="wr-report" aria-live="polite">
                <span className="wr-eyebrow">
                  05 / GM CONTINGENCY DECISION
                </span>

                <h3>{selected.player}</h3>

                <p>
                  Your personnel nomination is recorded
                  for review. This is a scouting choice,
                  not an allocation of minutes.
                  Use the Rotation Decision Lab below
                  to choose the unavailable player and
                  inspect the model's actual
                  redistribution of minutes.
                </p>

                <p>
                  The nominated player is not
                  automatically assigned additional
                  minutes. Model results and this
                  decision must be interpreted
                  separately.
                </p>

                <button
                  type="button"
                  onClick={() => setCommitted(false)}
                >
                  REOPEN DECISION ↗
                </button>
              </div>
            )}

            {scenarioId === "ABSENCE" && (
              <RotationDecisionLab
                team={team}
                candidates={candidates}
                selectedPlayer={selected}
              />
            )}

            <div className="wr-method">
              <button
                type="button"
                aria-expanded={methodOpen}
                onClick={() =>
                  setMethodOpen(
                    (value) => !value
                  )
                }
              >
                DATA SOURCES & LIMITATIONS

                <span>
                  {methodOpen ? "−" : "+"}
                </span>
              </button>

              {methodOpen && (
                <div>
                  <p>
                    Historical statistics come
                    from available 2025–26
                    regular-season player
                    profiles. Projected minutes,
                    roster status and starter
                    designations refer to
                    2026–27 projections.
                  </p>

                  <p>
                    True Shooting and 3PT%
                    are stored as proportions
                    and displayed as percentages.
                    Per-36 figures normalize
                    counting statistics for
                    playing time but do not
                    adjust for role, usage,
                    opponent strength or
                    lineup context.
                  </p>

                  <p>
                    Scouting strengths and
                    watchouts compare only
                    these three candidates.
                    They are not league-wide
                    rankings. Missing data
                    remain unavailable.
                    This exercise does not
                    simulate salaries, trades,
                    contracts or future wins.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
