
import { useEffect, useMemo, useState } from "react";
import "./WarRoomAbsence.css";

// NBA_DNA_STAGE33_4B

const MODEL_STATES = [
  {
    value: "FULL_ROLE",
    label: "Full role"
  },
  {
    value: "HALF_ROLE",
    label: "Half role"
  },
  {
    value: "UNAVAILABLE",
    label: "Unavailable"
  }
];

function number(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function format(value) {
  const n = number(value);
  return n === null ? "N/A" : n.toFixed(1);
}

export default function WarRoomAbsence({ team }) {
  const [summary, setSummary] = useState(null);
  const [players, setPlayers] = useState(null);
  const [error, setError] = useState("");
  const [target, setTarget] = useState("");
  const [scenario, setScenario] = useState("UNAVAILABLE");

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      fetch(
        "/data/front_office_universal_summary_19gd.json",
        { signal: controller.signal }
      ),
      fetch(
        "/data/front_office_universal_players_19gd.json",
        { signal: controller.signal }
      )
    ])
      .then(async ([a, b]) => {
        if (!a.ok || !b.ok) {
          throw new Error(
            "The rotation model could not be loaded."
          );
        }

        return Promise.all([a.json(), b.json()]);
      })
      .then(([a, b]) => {
        setSummary(a);
        setPlayers(b);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      });

    return () => controller.abort();
  }, []);

  const teamCases = useMemo(
    () =>
      (summary || []).filter(
        (item) => item.team === team
      ),
    [summary, team]
  );

  const targets = useMemo(
    () =>
      [...new Set(
        teamCases.map((item) => item.target_player)
      )].sort(),
    [teamCases]
  );

  useEffect(() => {
    setTarget("");
    setScenario("UNAVAILABLE");
  }, [team]);

  const activeTarget = targets.includes(target)
    ? target
    : targets[0] || "";

  const activeSummary = teamCases.find(
    (item) =>
      item.target_player === activeTarget &&
      item.scenario === scenario
  );

  const rotation = useMemo(
    () =>
      (players || []).filter(
        (item) =>
          item.team === team &&
          item.target_player === activeTarget &&
          item.scenario === scenario
      ),
    [players, team, activeTarget, scenario]
  );

  const recipients = rotation
    .filter(
      (item) =>
        !item.target_flag &&
        number(item.added_mpg) > 0
    )
    .sort(
      (a, b) =>
        number(b.added_mpg) -
        number(a.added_mpg)
    );

  const maxMinutes = Math.max(
    36,
    ...rotation.flatMap((item) => [
      number(item.baseline_mpg) || 0,
      number(item.scenario_mpg) || 0
    ])
  );

  return (
    <div className="wra-panel">
      <header className="wra-header">
        <span className="wr-eyebrow">
          ROTATION OPERATIONS / MODEL 19G-D
        </span>

        <h3>Run the contingency.</h3>

        <p>
          Select a projected rotation player and
          test a hypothetical reduction in minutes.
          Results are calculated by the existing
          rotation model, not generated from your
          scouting nomination.
        </p>
      </header>

      {error && (
        <p role="alert">{error}</p>
      )}

      {!summary && !error && (
        <p>Loading rotation model...</p>
      )}

      {summary && targets.length === 0 && (
        <p>
          No modeled rotation cases are available
          for this franchise.
        </p>
      )}

      {targets.length > 0 && (
        <>
          <div className="wra-controls">
            <label>
              <span>PLAYER TO MODEL</span>

              <select
                value={activeTarget}
                onChange={(e) =>
                  setTarget(e.target.value)
                }
              >
                {targets.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>

            <div className="wra-state-control">
              <span>AVAILABILITY SCENARIO</span>

              <div className="wra-states">
                {MODEL_STATES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    aria-pressed={
                      scenario === item.value
                    }
                    className={
                      scenario === item.value
                        ? "wra-active"
                        : ""
                    }
                    onClick={() =>
                      setScenario(item.value)
                    }
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {activeSummary ? (
            <>
              <div className="wra-summary">
                <div>
                  <small>MINUTES REMOVED</small>
                  <strong>
                    {format(
                      activeSummary.minutes_removed
                    )}
                  </strong>
                </div>

                <div>
                  <small>REDISTRIBUTED</small>
                  <strong>
                    {format(
                      activeSummary.minutes_redistributed
                    )}
                  </strong>
                </div>

                <div>
                  <small>UNALLOCATED</small>
                  <strong>
                    {format(
                      activeSummary.minutes_unallocated
                    )}
                  </strong>
                </div>
              </div>

              <div className="wra-rotation-heading">
                <h4>Projected rotation impact</h4>
                <span>
                  BASELINE / SCENARIO · MPG
                </span>
              </div>

              <div className="wra-rotation">
                {rotation.map((item) => (
                  <div
                    className="wra-player"
                    key={item.player}
                  >
                    <div className="wra-player-name">
                      <strong>{item.player}</strong>

                      {item.target_flag && (
                        <small>TARGET</small>
                      )}
                    </div>

                    <div className="wra-bars">
                      <div className="wra-track">
                        <div
                          className="wra-baseline"
                          style={{
                            width:
                              `${100 * (
                                number(
                                  item.baseline_mpg
                                ) || 0
                              ) / maxMinutes}%`
                          }}
                        />
                      </div>

                      <div className="wra-track">
                        <div
                          className="wra-scenario"
                          style={{
                            width:
                              `${100 * (
                                number(
                                  item.scenario_mpg
                                ) || 0
                              ) / maxMinutes}%`
                          }}
                        />
                      </div>
                    </div>

                    <div className="wra-values">
                      <span>
                        {format(item.baseline_mpg)}
                      </span>

                      <strong>
                        {format(item.scenario_mpg)}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>

              <div className="wra-recipients">
                <h4>Minutes absorbed by teammates</h4>

                {recipients.length ? (
                  recipients.map((item) => (
                    <div key={item.player}>
                      <span>{item.player}</span>

                      <strong>
                        +{format(item.added_mpg)} MPG
                      </strong>
                    </div>
                  ))
                ) : (
                  <p>
                    No additional minutes were
                    assigned to teammates in this
                    scenario.
                  </p>
                )}
              </div>

              <div className="wra-disclosure">
                <strong>HOW TO READ THIS MODEL</strong>

                <p>
                  Full role retains the original
                  projected role. Half role reduces
                  the target's minutes. Unavailable
                  removes the target from the
                  modeled rotation.
                </p>

                <p>
                  Minutes are redistributed only
                  where model assumptions permit.
                  Unallocated minutes are reported
                  rather than assigned artificially.
                  This is not a prediction of wins,
                  scoring or actual coaching decisions.
                </p>

                <p>
                  Source: Universal Rotation Model
                  19G-D. Reconciliation error:{" "}
                  {format(
                    activeSummary.reconciliation_error
                  )}.
                </p>
              </div>
            </>
          ) : (
            <p>
              No calculated result exists for
              this selection.
            </p>
          )}
        </>
      )}
    </div>
  );
}

