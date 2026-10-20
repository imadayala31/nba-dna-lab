
import { useEffect, useMemo, useState } from "react";
import "./AbsenceRipple.css";

const FEATURED = [
  {
    team: "Dallas Mavericks",
    player: "Kyrie Irving",
    color: "#00538c",
    code: "DAL",
  },
  {
    team: "Houston Rockets",
    player: "Fred VanVleet",
    color: "#ce1141",
    code: "HOU",
  },
  {
    team: "Indiana Pacers",
    player: "Tyrese Haliburton",
    color: "#002d62",
    code: "IND",
  },
  {
    team: "Portland Trail Blazers",
    player: "Damian Lillard",
    color: "#e03a3e",
    code: "POR",
  },
  {
    team: "Minnesota Timberwolves",
    player: "Trey Lyles",
    color: "#236192",
    code: "MIN",
  },
];

const SCENARIOS = [
  { id: "FULL_ROLE", label: "FULL ROLE" },
  { id: "HALF_ROLE", label: "HALF ROLE" },
  { id: "UNAVAILABLE", label: "UNAVAILABLE" },
];

const format = (value) =>
  Number.isFinite(Number(value))
    ? Number(value).toFixed(1)
    : "—";

const initials = (name = "") =>
  String(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

function Portrait({ name, url, large = false }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [url]);

  return (
    <div
      className={`ripple-portrait ${
        large ? "ripple-portrait-large" : ""
      }`}
    >
      {url && !failed ? (
        <img
          src={url}
          alt={name}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{initials(name)}</span>
      )}
    </div>
  );
}

function getPhoto(atlas, team, name) {
  const player = atlas.find(
    (item) =>
      item.team === team &&
      item.player === name
  );

  /* NBA_DNA_VETERAN_PORTRAITS_V1 */
const veteranPortraits = {
  "Kyrie Irving": "/images/players/espn_6442.png",
  "Damian Lillard": "/images/players/espn_6606.png",
  "Fred VanVleet": "/images/players/espn_2991230.png",
  "Trey Lyles": "/images/players/espn_3136196.png",
  "Tyrese Haliburton": "/images/players/espn_4396993.png",
  /* NBA_DNA_ROOKIE_PORTRAITS_V1 */
  "Mikel Brown": "/images/players/espn_5101761.png",
  "Caleb Wilson": "/images/players/espn_5095151.png",
  "Morez Johnson": "/images/players/espn_4873153.png",
  "Yaxel Lendeborg": "/images/players/espn_5175737.png",
  "Cameron Boozer": "/images/players/espn_5041935.png",
  "Darius Acuff": "/images/players/espn_5142620.png",
  "Darryn Peterson": "/images/players/espn_5041955.png",
  "AJ Dybantsa": "/images/players/espn_5142718.png"
};

return veteranPortraits[name] ||
  player?.headshot_url || null;
}

function getTeamCode(team) {
  return (
    FEATURED.find(
      (item) => item.team === team
    )?.code ||
    String(team || "")
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 3)
  );
}

function Network({
  team,
  player,
  scenario,
  links,
  atlas,
  color,
}) {
  const recipients = links
    .filter(
      (item) =>
        item.team === team &&
        item.target_player === player &&
        item.scenario === scenario
    )
    .sort(
      (a, b) =>
        Number(b.added_mpg) -
        Number(a.added_mpg)
    );

  return (
    <div
      className="ripple-network"
      style={{
        "--ripple-accent": color,
      }}
    >
      <div className="ripple-network-topline">
        <span>MODEL REALLOCATION NETWORK</span>
        <span>
          {recipients.length} RECIPIENTS
        </span>
      </div>

      <div className="ripple-network-stage">
        <div className="ripple-source-node">
          <Portrait
            name={player}
            url={getPhoto(atlas, team, player)}
            large
          />

          <div className="ripple-node-eyebrow">
            SCENARIO SUBJECT
          </div>

          <strong>{player}</strong>

          <span>
            {getTeamCode(team)} / PROJECTED ROTATION
          </span>
        </div>

        <div className="ripple-recipient-column">
          {recipients.length ? (
            recipients.map((item) => (
              <div
                className="ripple-recipient"
                key={`${item.target}-${scenario}`}
              >
                <Portrait
                  name={item.target}
                  url={getPhoto(
                    atlas,
                    team,
                    item.target
                  )}
                />

                <div className="ripple-recipient-name">
                  <strong>{item.target}</strong>

                  <span>
                    {item.target_position}
                  </span>
                </div>

                <div className="ripple-recipient-value">
                  +{format(item.added_mpg)}
                  <span>MPG</span>
                </div>
              </div>
            ))
          ) : (
            <div className="ripple-no-links">
              <span>NO MINUTES REALLOCATED</span>

              <p>
                The baseline rotation remains
                unchanged in this scenario.
              </p>
            </div>
          )}
        </div>

        <svg
          className="ripple-network-lines ripple-universal-lines"
          viewBox="0 0 1000 480"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {recipients.map((item, index) => {
            const count = recipients.length;

            const y =
              count === 1
                ? 240
                : 75 +
                  (330 * index) / (count - 1);

            const added =
              Number(item.added_mpg) || 0;

            const path =
              `M 275 240 C 460 240, ` +
              `520 ${y}, 675 ${y}`;

            return (
              <g key={item.target}>
                <path
                  d={path}
                  stroke={color}
                  strokeOpacity=".13"
                  strokeWidth={Math.max(
                    8,
                    added * 3
                  )}
                  strokeLinecap="round"
                  fill="none"
                />

                <path
                  d={path}
                  stroke={color}
                  strokeOpacity=".75"
                  strokeWidth={Math.max(
                    2,
                    added
                  )}
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="ripple-network-footnote">
        <span>
          LINE WEIGHT = ADDITIONAL PROJECTED MPG
        </span>

        <span>
          MODEL ALLOCATION / NOT PASSING DATA
        </span>
      </div>
    </div>
  );
}

export default function AbsenceRipple({
  team = "Dallas Mavericks",
  teamColor = "#00538c",
  selectedPlayerName = null,
  onPlayerSelect,
  selectionEvent = null,
}) {
  const [data, setData] = useState({
    atlas: [],
    links: [],
    summary: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [scenario, setScenario] =
    useState("FULL_ROLE");

  // NBA_DNA_STAGE29C2_SCENARIO_RESET
  useEffect(() => {
    setScenario("FULL_ROLE");
  }, [selectedPlayerName, team]);

  useEffect(() => {
    if (!selectionEvent?.player) return;

    setScenario("FULL_ROLE");

    if (
      selectionEvent.source !== "court" ||
      selectionEvent.team !== team ||
      !selectionEvent.scrollToRipple
    ) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      const section =
        document.getElementById("absence-ripple");

      if (!section) return;

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      section.scrollIntoView({
        behavior: reducedMotion
          ? "auto"
          : "smooth",
        block: "start",
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [selectionEvent, team]);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError("");

        const paths = [
          "/data/front_office_league_atlas_19fb.json",
          "/data/front_office_universal_links_19gd.json",
          "/data/front_office_universal_summary_19gd.json",
        ];

        const responses = await Promise.all(
          paths.map((path) =>
            fetch(path, {
              signal: controller.signal,
            })
          )
        );

        for (const response of responses) {
          if (!response.ok) {
            throw new Error(
              `HTTP ${response.status}`
            );
          }
        }

        const [atlas, links, summary] =
          await Promise.all(
            responses.map((response) =>
              response.json()
            )
          );

        if (
          ![atlas, links, summary].every(
            Array.isArray
          )
        ) {
          throw new Error("Invalid JSON data");
        }

        setData({
          atlas,
          links,
          summary,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => controller.abort();
  }, []);

  const rotation = useMemo(
    () =>
      data.atlas
        .filter((item) => item.team === team)
        .sort(
          (a, b) =>
            Number(b.projected_mpg) -
            Number(a.projected_mpg)
        ),
    [data.atlas, team]
  );

  const activeTeam = team;

  const activePlayer =
    rotation.find(
      (item) =>
        item.player === selectedPlayerName
    )?.player ||
    selectedPlayerName ||
    rotation[0]?.player ||
    FEATURED.find(
      (item) => item.team === team
    )?.player ||
    "";

  const activeColor =
    FEATURED.find(
      (item) => item.team === activeTeam
    )?.color || teamColor;

  const activeSummary = data.summary.find(
    (item) =>
      item.team === activeTeam &&
      item.target_player === activePlayer &&
      item.scenario === scenario
  );

  const activeLinks = data.links.filter(
    (item) =>
      item.team === activeTeam &&
      item.target_player === activePlayer &&
      item.scenario === scenario
  );

  const removed = Number(
    activeSummary?.minutes_removed || 0
  );

  const redistributed = Number(
    activeSummary?.minutes_redistributed || 0
  );

  const unallocated = Number(
    activeSummary?.minutes_unallocated || 0
  );

  const denominator = Math.max(removed, 1);

  function choosePlayer(player, nextTeam) {
    onPlayerSelect?.({
      player,
      team: nextTeam,
    });
  }

  return (
    <section
      className="ripple-section"
      id="absence-ripple"
      style={{
        "--ripple-accent": activeColor,
        scrollMarginTop: "28px",
      }}
    >
      <div className="ripple-heading">
        <div>
          <div className="ripple-kicker">
            07 / ROTATION STRESS TEST
          </div>

          <h2>
            THE ABSENCE
            <br />
            <em>RIPPLE.</em>
          </h2>
        </div>

        <p>
          270 projected players. 810 hypothetical
          scenarios. Explore how a rotation
          reallocates minutes under constraints.
        </p>
      </div>

      <div className="ripple-case-intro">
        <span>FEATURED CASE STUDIES</span>
        <span>
          ORIGINAL 18AT / REPRODUCED EXACTLY
        </span>
      </div>

      <div className="ripple-case-grid">
        {FEATURED.map((item, index) => (
          <button
            type="button"
            key={item.player}
            className={`ripple-case-card ${
              activePlayer === item.player &&
              activeTeam === item.team
                ? "is-active"
                : ""
            }`}
            style={{
              "--case-color": item.color,
            }}
            onClick={() =>
              choosePlayer(
                item.player,
                item.team
              )
            }
            aria-pressed={
              activePlayer === item.player &&
              activeTeam === item.team
            }
          >
            <div className="ripple-case-number">
              {String(index + 1).padStart(
                2,
                "0"
              )}{" "}
              / {item.code}
            </div>

            <Portrait
              name={item.player}
              url={getPhoto(
                data.atlas,
                item.team,
                item.player
              )}
            />

            <strong>{item.player}</strong>

            <span className="ripple-case-team">
              {item.team}
            </span>

            <span className="ripple-case-action">
              EXPLORE CASE{" "}
              <span aria-hidden="true">↗</span>
            </span>
          </button>
        ))}
      </div>

      <div className="ripple-universal-roster">
        <div className="ripple-universal-heading">
          <div>
            <span className="ripple-overline">
              LEAGUE-WIDE SCENARIO ENGINE
            </span>

            <h3>EXPLORE THE ROTATION.</h3>

            <p>
              {team} · Select any player to
              open a modeled absence.
            </p>
          </div>

          <span className="ripple-universal-count">
            {rotation.length} PLAYERS
          </span>
        </div>

        <div className="ripple-universal-grid">
          {rotation.map((item) => {
            const isActive =
              activePlayer === item.player &&
              activeTeam === item.team;

            return (
              <button
                type="button"
                key={`${item.team}-${item.player}`}
                className={`ripple-universal-player ${
                  isActive ? "is-active" : ""
                }`}
                onClick={() =>
                  choosePlayer(
                    item.player,
                    item.team
                  )
                }
                aria-pressed={isActive}
              >
                <Portrait
                  name={item.player}
                  url={getPhoto(
                    data.atlas,
                    item.team,
                    item.player
                  )}
                />

                <span className="ripple-universal-player-info">
                  <strong>{item.player}</strong>

                  <small>
                    {item.primary_position ||
                      "ROTATION"}
                  </small>
                </span>

                <span className="ripple-universal-mpg">
                  {format(item.projected_mpg)}
                  <small>MPG</small>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="ripple-experiment-header">
        <div>
          <span className="ripple-overline">
            SELECTED EXPERIMENT /{" "}
            {getTeamCode(activeTeam)}
          </span>

          <h3>{activePlayer}</h3>

          <p>
            {activeTeam} · Hypothetical availability
          </p>
        </div>

        <div className="ripple-scenario-switch">
          {SCENARIOS.map((item) => (
            <button
              type="button"
              key={item.id}
              className={
                scenario === item.id
                  ? "is-active"
                  : ""
              }
              onClick={() =>
                setScenario(item.id)
              }
              aria-pressed={
                scenario === item.id
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="ripple-loading">
          LOADING LEAGUE-WIDE SCENARIOS…
        </div>
      ) : error ? (
        <div className="ripple-error">
          Could not load scenario data:{" "}
          {error}
        </div>
      ) : !activeSummary ? (
        <div className="ripple-error">
          No scenario record found for this player.
        </div>
      ) : (
        <>
          <div className="ripple-main-grid">
            <Network
              team={activeTeam}
              player={activePlayer}
              scenario={scenario}
              links={data.links}
              atlas={data.atlas}
              color={activeColor}
            />

            <aside className="ripple-impact-panel">
              <div className="ripple-panel-heading">
                <span>SCENARIO BALANCE</span>

                <span>
                  {scenario.replaceAll(
                    "_",
                    " "
                  )}
                </span>
              </div>

              <div className="ripple-primary-stat">
                <strong>
                  {format(removed)}
                </strong>

                <span>MPG REMOVED</span>
              </div>

              <div className="ripple-balance-track">
                <div
                  className="ripple-balance-assigned"
                  style={{
                    width: `${
                      (redistributed /
                        denominator) *
                      100
                    }%`,
                  }}
                />

                <div
                  className="ripple-balance-unallocated"
                  style={{
                    width: `${
                      (unallocated /
                        denominator) *
                      100
                    }%`,
                  }}
                />
              </div>

              <div className="ripple-balance-legend">
                <div>
                  <span className="ripple-legend-dot assigned" />
                  <span>Redistributed</span>

                  <strong>
                    {format(redistributed)}
                  </strong>
                </div>

                <div>
                  <span className="ripple-legend-dot unallocated" />
                  <span>Unallocated</span>

                  <strong>
                    {format(unallocated)}
                  </strong>
                </div>
              </div>

              <div className="ripple-impact-divider" />

              <div className="ripple-detail-row">
                <span>RECIPIENTS</span>
                <strong>
                  {activeLinks.length}
                </strong>
              </div>

              <div className="ripple-detail-row">
                <span>SCENARIO TEAM MPG</span>

                <strong>
                  {format(
                    activeSummary.scenario_team_mpg
                  )}
                </strong>
              </div>

              <div className="ripple-detail-row">
                <span>BASELINE TEAM MPG</span>

                <strong>
                  {format(
                    activeSummary.baseline_team_mpg
                  )}
                </strong>
              </div>

              <div className="ripple-impact-divider" />

              <p className="ripple-panel-note">
                Unallocated minutes are a
                consequence of the model
                constraints. They do not imply
                that an NBA team would play
                short-handed.
              </p>
            </aside>
          </div>

          <div className="ripple-reading">
            <span>
              HOW TO READ THIS EXPERIMENT
            </span>

            <p>
              Each connection represents additional
              modeled minutes assigned to a teammate.
              The network does not depict passes,
              player chemistry, equivalent skill
              replacement, or predicted wins.
              Expanded scenarios are exploratory
              when historical assists proxies
              are unavailable.
            </p>
          </div>
        </>
      )}

      <div className="ripple-methodology">
        <span>
          PROJECTED / HYPOTHETICAL
        </span>

        <p>
          2026–27 frozen projected rotations.
          Position compatibility is a model
          assumption. Each teammate may receive
          at most six additional MPG and is
          subject to a 36-MPG allocation cap.
          Original five cases reproduced exactly
          against 18AT. No injury, production,
          or win prediction is made.
        </p>
      </div>
    </section>
  );
}