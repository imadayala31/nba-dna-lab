
import { useEffect, useState } from "react";
import "./LivingCourt.css";

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const isStarter = (value) =>
  value === true ||
  value === 1 ||
  value === "1" ||
  String(value).toLowerCase() === "true";

function initials(name) {
  return String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

/* NBA_DNA_VETERAN_PORTRAITS_V1 */
const VETERAN_PORTRAITS = {
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

function courtPortraitUrl(player) {
  if (!player) return null;
  return VETERAN_PORTRAITS[player.player] ||
    player.headshot_url || null;
}

function CourtPortrait({ player }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [player?.headshot_url, player?.player]);

  if (!player) return null;

  return (
    <div className="court-portrait">
      {courtPortraitUrl(player) && !failed ? (
        <img
          src={courtPortraitUrl(player)}
          alt={player.player}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{initials(player.player)}</span>
      )}
    </div>
  );
}

const POSITIONS = [
  { x: 50, y: 70, label: "PG" },
  { x: 21, y: 54, label: "SG" },
  { x: 79, y: 54, label: "SF" },
  { x: 30, y: 27, label: "PF" },
  { x: 70, y: 27, label: "C" },
];

function normalizePosition(position) {
  const p = String(position || "").toUpperCase();

  if (p.includes("PG") || p === "G") return "PG";
  if (p.includes("SG")) return "SG";
  if (p.includes("SF") || p === "F") return "SF";
  if (p.includes("PF")) return "PF";
  if (p.includes("C")) return "C";

  return "";
}

function assignCourtSlots(players) {
  const available = [...players];
  const slots = [];

  for (const position of POSITIONS) {
    const index = available.findIndex(
      (player) =>
        normalizePosition(player.primary_position) ===
        position.label
    );

    if (index >= 0) {
      slots.push(available.splice(index, 1)[0]);
    } else {
      slots.push(null);
    }
  }

  for (let i = 0; i < slots.length; i += 1) {
    if (!slots[i] && available.length) {
      slots[i] = available.shift();
    }
  }

  return slots;
}

export default function LivingCourt({
  team,
  players = [],
  teamColor = "#2563EB",
  selectedPlayerName = null,
  onPlayerSelect,
}) {
  const [unit, setUnit] = useState("starters");

  const sorted = [...players].sort(
    (a, b) =>
      toNumber(b.projected_mpg) -
      toNumber(a.projected_mpg)
  );

  const starters = sorted
    .filter((player) => isStarter(player.projected_starter))
    .slice(0, 5);

  const reserves = sorted
    .filter((player) => !isStarter(player.projected_starter))
    .slice(0, 5);

  const sharedPlayer = players.find(
    (player) => player.player === selectedPlayerName
  );

  useEffect(() => {
    if (!sharedPlayer) return;

    setUnit(
      isStarter(sharedPlayer.projected_starter)
        ? "starters"
        : "reserves"
    );
  }, [sharedPlayer?.athlete_key, selectedPlayerName]);

  const visiblePlayers =
    unit === "starters" ? starters : reserves;

  const courtSlots = assignCourtSlots(visiblePlayers);

  const selectedPlayer =
    visiblePlayers.find(
      (player) =>
        player.player === selectedPlayerName
    ) ||
    visiblePlayers[0] ||
    null;

  const totalMpg = visiblePlayers.reduce(
    (sum, player) =>
      sum + toNumber(player.projected_mpg),
    0
  );

  function handlePlayerClick(player) {
    onPlayerSelect?.(player);
  }

  function changeUnit(nextUnit) {
    setUnit(nextUnit);

    const nextPlayers =
      nextUnit === "starters" ? starters : reserves;

    const currentStillVisible = nextPlayers.some(
      (player) =>
        player.player === selectedPlayerName
    );

    if (!currentStillVisible && nextPlayers[0]) {
      onPlayerSelect?.(nextPlayers[0], {
        scrollToRipple: false,
      });
    }
  }

  return (
    <section
      className="living-court-section"
      style={{
        "--court-team-color": teamColor,
      }}
    >
      <div className="living-court-intro">
        <div>
          <p className="living-court-eyebrow">
            06 / ROTATION INTELLIGENCE
          </p>

          <h2>THE LIVING COURT.</h2>

          <p>
            Nine players. One projected rotation.
            Explore the lineup structure behind
            {` ${team}`}'s preseason plan.
          </p>
        </div>

        <div className="court-unit-switch">
          <button
            type="button"
            className={
              unit === "starters" ? "selected" : ""
            }
            aria-pressed={unit === "starters"}
            onClick={() => changeUnit("starters")}
          >
            PROJECTED STARTERS
          </button>

          <button
            type="button"
            className={
              unit === "reserves" ? "selected" : ""
            }
            aria-pressed={unit === "reserves"}
            onClick={() => changeUnit("reserves")}
          >
            SECOND UNIT
          </button>
        </div>
      </div>

      <div className="living-court-layout">
        <div className="court-surface">
          <div className="court-grain" />

          <svg
            className="court-lines"
            viewBox="0 0 900 680"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <rect
              x="16"
              y="16"
              width="868"
              height="648"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />

            <path
              d="M310 16 V250 H590 V16"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />

            <circle
              cx="450"
              cy="250"
              r="100"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />

            <path
              d="M16 200 H85 A365 365 0 0 0 815 200 H884"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />

            <path
              d="M390 75 H510"
              stroke="currentColor"
              strokeWidth="5"
            />

            <circle
              cx="450"
              cy="95"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />

            <path
              d="M350 664 A100 100 0 0 1 550 664"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
          </svg>

          <div className="court-corner-label">
            {team.toUpperCase()} /{" "}
            {unit === "starters"
              ? "PROJECTED STARTERS"
              : "SECOND UNIT"}
          </div>

          {courtSlots.map((player, index) => {
            if (!player) return null;

            const key = String(
              player.athlete_key || player.player
            );

            const active =
              selectedPlayer?.player === player.player;

            return (
              <button
                key={key}
                type="button"
                className={`court-player ${
                  active ? "court-player-active" : ""
                }`}
                style={{
                  left: `${POSITIONS[index].x}%`,
                  top: `${POSITIONS[index].y}%`,
                }}
                onClick={() => handlePlayerClick(player)}
                aria-pressed={active}
                title={`Explore ${player.player}'s absence scenario`}
              >
                <CourtPortrait player={player} />

                <span className="court-player-name">
                  {player.player}
                </span>

                <span className="court-player-mpg">
                  {toNumber(
                    player.projected_mpg
                  ).toFixed(1)}{" "}
                  MPG
                </span>
              </button>
            );
          })}

          <div className="court-footnote">
            SCHEMATIC POSITIONS / NOT TRACKING DATA
          </div>
        </div>

        <aside className="court-insight">
          <div className="court-insight-header">
            <span>ON-COURT INTELLIGENCE</span>
            <span>2026–27</span>
          </div>

          <div className="court-insight-stat">
            <strong>{visiblePlayers.length}</strong>
            <span>PLAYERS DISPLAYED</span>
          </div>

          <div className="court-insight-stat">
            <strong>{totalMpg.toFixed(1)}</strong>
            <span>SUM OF PROJECTED PLAYER MPG</span>
          </div>

          <div className="court-insight-divider" />

          {selectedPlayer ? (
            <div className="court-selected-player">
              <span>SELECTED PLAYER</span>

              <h3>{selectedPlayer.player}</h3>

              <div className="court-selected-mpg">
                <strong>
                  {toNumber(
                    selectedPlayer.projected_mpg
                  ).toFixed(1)}
                </strong>
                <span>PROJECTED MPG</span>
              </div>

              <p>
                {selectedPlayer.primary_position ||
                  "Rotation player"}
                {" / "}
                {isStarter(
                  selectedPlayer.projected_starter
                )
                  ? "Projected starter"
                  : "Projected reserve"}
              </p>
            </div>
          ) : (
            <p>No player selected.</p>
          )}

          <div className="court-insight-note">
            <strong>HOW TO READ THIS COURT</strong>

            <p>
              Player placement is a schematic layout
              based on listed positions. It does not
              represent tracking coordinates, shot
              locations, lineup chemistry or a
              five-player unit expected to share
              the floor.
            </p>

            <p>
              Projected MPG values are individual
              preseason allocations. Their sum
              is not a prediction of minutes
              played together.
            </p>

            <p>
              Select any portrait to synchronize
              that player across The Living Court,
              The Absence Ripple and The Player DNA.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}