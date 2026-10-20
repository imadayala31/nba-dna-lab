
import RookiePreseasonProfile from "./RookiePreseasonProfile";
import ShotDNAProvenance from "./ShotDNAProvenance";

import { useEffect, useMemo, useState } from "react";
import "./ShotDNA.css";

/*
 * NBA DNA LAB — THE SHOT DNA
 * 19H-K-AH / ELITE SHOT INSPECTOR
 *
 * Basket at top.
 * Team-branded hardwood.
 * Hover, click-to-pin, keyboard and touch inspection.
 *
 * Source data is not modified.
 * ESPN spatial mapping remains provisional.
 */

const PLAYER_DATA_DIR = "/data/shot_dna_2025_26";

const COURT = {
  width: 50,
  length: 47,
  hoopX: 25,
  hoopY: 5.25,
  paintWidth: 16,
  freeThrowY: 19,
  freeThrowRadius: 6,
  restrictedRadius: 4,
  threeRadius: 23.75,
  cornerDistance: 22,
};

const SCALE = 10;
const W = COURT.width * SCALE;
const H = COURT.length * SCALE;

const FILTERS = ["ALL", "MADE", "MISSED", "BLOCKED"];

const COLORS = {
  MADE: "#168F7C",
  MISSED: "#E7794F",
  BLOCKED: "#7766C9",
};

const ZONES = [
  "RESTRICTED AREA",
  "PAINT / NON-RA",
  "MID-RANGE",
  "THREE-POINT RANGE",
];

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
  "LA Clippers": "lac",
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
  "Washington Wizards": "wsh",
};

function teamLogo(name) {
  const code = TEAM_CODES[String(name || "").trim()];

  return code
    ? `https://a.espncdn.com/i/teamlogos/nba/500/${code}.png`
    : null;
}

function num(value) {
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

function percentage(made, attempts) {
  return attempts
    ? `${((made / attempts) * 100).toFixed(1)}%`
    : "—";
}

function outcome(shot) {
  const result = String(shot.result || "").toUpperCase();

  if (result === "BLOCKED") return "BLOCKED";
  if (result === "MADE") return "MADE";

  return "MISSED";
}

function eventKey(shot) {
  return String(shot?.event_id ?? "");
}

/*
 * Provisional ESPN -> NBA court transform.
 * Same transform as stage AG.
 *
 * ESPN inferred hoop: (25, 0)
 * NBA hoop: (25, 5.25)
 */

function courtPoint(x, y) {
  return {
    x: x * SCALE,
    y: y * SCALE,
  };
}

function shotPoint(shot) {
  const x = num(shot.x);
  const y = num(shot.y);

  if (x === null || y === null) return null;

  const courtY = y + COURT.hoopY;

  if (
    x < 0 ||
    x > COURT.width ||
    courtY < 0 ||
    courtY > COURT.length
  ) {
    return null;
  }

  return courtPoint(x, courtY);
}

function shotDistance(shot) {
  const x = num(shot.x);
  const y = num(shot.y);

  if (x === null || y === null) return null;

  return Math.hypot(x - COURT.hoopX, y);
}

function isThree(shot) {
  const x = num(shot.x);
  const y = num(shot.y);

  if (x === null || y === null) return false;

  const distance = shotDistance(shot);

  if (distance === null) return false;

  const corner =
    Math.abs(x - COURT.hoopX) >= COURT.cornerDistance;

  const cornerEnd = Math.sqrt(
    COURT.threeRadius ** 2 -
      COURT.cornerDistance ** 2
  );

  if (corner && y <= cornerEnd) return true;

  return distance >= COURT.threeRadius;
}

function zoneOf(shot) {
  const x = num(shot.x);
  const y = num(shot.y);
  const distance = shotDistance(shot);

  if (x === null || y === null || distance === null) {
    return null;
  }

  if (isThree(shot)) return "THREE-POINT RANGE";

  if (distance <= COURT.restrictedRadius) {
    return "RESTRICTED AREA";
  }

  const insidePaint =
    Math.abs(x - COURT.hoopX) <=
      COURT.paintWidth / 2 &&
    y + COURT.hoopY <= COURT.freeThrowY;

  return insidePaint ? "PAINT / NON-RA" : "MID-RANGE";
}

function shotDescription(shot) {
  return shot.description || "Field-goal attempt";
}

function shotTime(shot) {
  return [
    shot.period != null ? `Q${shot.period}` : "",
    shot.clock ? String(shot.clock) : "",
  ]
    .filter(Boolean)
    .join(" / ");
}

function CourtGeometry() {
  const hoop = courtPoint(COURT.hoopX, COURT.hoopY);
  const ftY = COURT.freeThrowY * SCALE;

  const paintLeft =
    (COURT.hoopX - COURT.paintWidth / 2) * SCALE;

  const cornerLeft =
    (COURT.hoopX - COURT.cornerDistance) * SCALE;

  const cornerRight =
    (COURT.hoopX + COURT.cornerDistance) * SCALE;

  const cornerY =
    (COURT.hoopY +
      Math.sqrt(
        COURT.threeRadius ** 2 -
          COURT.cornerDistance ** 2
      )) * SCALE;

  const threeR = COURT.threeRadius * SCALE;
  const restrictedR = COURT.restrictedRadius * SCALE;
  const ftR = COURT.freeThrowRadius * SCALE;

  return (
    <g className="sd-court-geometry">
      <rect
        x="0.75"
        y="0.75"
        width={W - 1.5}
        height={H - 1.5}
        className="sd-court-boundary"
      />

      <rect
        x={paintLeft}
        y="0"
        width={COURT.paintWidth * SCALE}
        height={ftY}
        className="sd-court-paint"
      />

      <path
        d={`
          M ${hoop.x - ftR} ${ftY}
          A ${ftR} ${ftR} 0 0 1
          ${hoop.x + ftR} ${ftY}
        `}
        className="sd-court-free-throw"
      />

      <path
        d={`
          M ${hoop.x - ftR} ${ftY}
          A ${ftR} ${ftR} 0 0 0
          ${hoop.x + ftR} ${ftY}
        `}
        className="sd-court-free-throw-dashed"
      />

      <path
        d={`
          M ${cornerLeft} 0
          L ${cornerLeft} ${cornerY}
          A ${threeR} ${threeR} 0 0 0
          ${cornerRight} ${cornerY}
          L ${cornerRight} 0
        `}
        className="sd-court-three"
      />

      <path
        d={`
          M ${hoop.x - restrictedR} ${hoop.y}
          A ${restrictedR} ${restrictedR} 0 0 0
          ${hoop.x + restrictedR} ${hoop.y}
        `}
        className="sd-court-restricted"
      />

      <line
        x1={hoop.x - 30}
        y1="40"
        x2={hoop.x + 30}
        y2="40"
        className="sd-court-backboard"
      />

      <circle
        cx={hoop.x}
        cy={hoop.y}
        r="7.5"
        className="sd-court-hoop"
      />

      <circle
        cx={hoop.x}
        cy={hoop.y}
        r="2"
        className="sd-court-hoop-center"
      />

      <text
        x="18"
        y="455"
        className="sd-court-coordinate"
      >
        NBA DNA LAB / 50 × 47 FT
      </text>

      <text
        x="482"
        y="455"
        textAnchor="end"
        className="sd-court-coordinate"
      >
        HALF COURT
      </text>
    </g>
  );
}

function makeDensity(shots) {
  const points = shots.map(shotPoint).filter(Boolean);

  if (!points.length) return [];

  const spacing = 16;
  const bandwidth = 28;
  const cells = [];

  for (let y = 8; y < H; y += spacing) {
    for (let x = 8; x < W; x += spacing) {
      let density = 0;

      for (const point of points) {
        const dx = x - point.x;
        const dy = y - point.y;

        density += Math.exp(
          -(dx * dx + dy * dy) /
            (2 * bandwidth * bandwidth)
        );
      }

      cells.push({ x, y, density });
    }
  }

  const maximum = Math.max(
    ...cells.map((cell) => cell.density),
    0.000001
  );

  return cells.map((cell) => ({
    ...cell,
    intensity: cell.density / maximum,
  }));
}

function DensityLayer({ shots }) {
  const cells = useMemo(() => makeDensity(shots), [shots]);

  return (
    <g className="sd-density-layer" pointerEvents="none">
      {cells
        .filter((cell) => cell.intensity >= 0.07)
        .map((cell) => (
          <rect
            key={`${cell.x}-${cell.y}`}
            x={cell.x - 8}
            y={cell.y - 8}
            width="16.3"
            height="16.3"
            fill="#F07848"
            opacity={Math.pow(cell.intensity, 1.5) * 0.76}
          />
        ))}
    </g>
  );
}

/*
 * Marker supports:
 * - Hover preview
 * - Click to pin/unpin
 * - Touch via pointer click
 * - Enter / Space keyboard selection
 *
 * Native SVG title removed to avoid
 * overlapping browser tooltips.
 */

function ShotMarker({
  shot,
  onHover,
  onLeave,
  onSelect,
  active,
  pinned,
}) {
  const point = shotPoint(shot);

  if (!point) return null;

  const result = outcome(shot);
  const color = COLORS[result];

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(shot);
    }

    if (event.key === "Escape") {
      event.preventDefault();
      onSelect(null);
    }
  }

  return (
    <g
      className={`sd-shot-marker ${
        active ? "sd-shot-active" : ""
      } ${pinned ? "sd-shot-pinned" : ""}`}
      transform={`translate(${point.x}, ${point.y})`}
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") {
          onHover(shot);
        }
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== "touch") {
          onLeave(shot);
        }
      }}
      onFocus={() => onHover(shot)}
      onBlur={() => onLeave(shot)}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(shot);
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-pressed={pinned}
      aria-label={`${result}: ${shotDescription(shot)}. ${
        pinned ? "Pinned" : "Select to inspect"
      }`}
      style={{
        cursor: "pointer",
        outline: "none",
      }}
    >
      <circle
        r="14"
        fill="transparent"
        className="sd-shot-hit-area"
      />

      {active && (
        <circle
          r={pinned ? 13 : 11}
          fill="none"
          stroke={color}
          strokeWidth={pinned ? 2.4 : 1.7}
          opacity="0.85"
          className="sd-interactive-ring"
          pointerEvents="none"
        />
      )}

      <circle
        r={active ? 8.2 : 6.6}
        fill={color}
        stroke="#FFFFFF"
        strokeWidth="2"
        pointerEvents="none"
      />

      {result === "MADE" ? (
        <circle
          r="1.8"
          fill="#FFFFFF"
          pointerEvents="none"
        />
      ) : (
        <path
          d="M-2.4 -2.4L2.4 2.4M2.4 -2.4L-2.4 2.4"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          pointerEvents="none"
        />
      )}
    </g>
  );
}

/*
 * Floating inspector uses SVG coordinates
 * converted to percentages.
 *
 * Card is clamped within the court container
 * to prevent edge clipping.
 */

function FloatingInspector({
  shot,
  pinned,
  onClose,
}) {
  const point = shot ? shotPoint(shot) : null;

  if (!shot || !point) return null;

  const result = outcome(shot);
  const color = COLORS[result];

  const left = Math.min(
    75,
    Math.max(25, (point.x / W) * 100)
  );

  const top = Math.min(
    79,
    Math.max(22, (point.y / H) * 100)
  );

  return (
    <div
      className="sd-floating-inspector"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        "--sd-inspector-color": color,
      }}
      role="status"
      aria-live="polite"
    >
      <div className="sd-floating-header">
        <span className="sd-floating-kicker">
          {pinned ? "PINNED EVENT" : "SHOT INTELLIGENCE"}
        </span>

        <button
          type="button"
          className="sd-floating-close"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          aria-label="Close shot inspector"
        >
          ×
        </button>
      </div>

      <div className="sd-floating-result">
        <span className="sd-floating-indicator" />
        <strong>{result}</strong>

        <span className="sd-floating-time">
          {shotTime(shot) || "GAME EVENT"}
        </span>
      </div>

      <p className="sd-floating-description">
        {shotDescription(shot)}
      </p>

      <div className="sd-floating-bottom">
        <span>{zoneOf(shot) || "UNCLASSIFIED"}</span>
        <span>
          {pinned ? "CLICK AGAIN TO UNPIN" : "CLICK TO PIN"}
        </span>
      </div>
    </div>
  );
}

function ShotCourt({
  shots,
  mode,
  activeShot,
  pinnedShot,
  onHover,
  onLeave,
  onSelect,
  onClear,
  teamName,
}) {
  const logo = teamLogo(teamName);

  const plotted = shots.filter(
    (shot) => shotPoint(shot) !== null
  ).length;

  const omitted = shots.length - plotted;

  return (
    <div className="sd-court-card">
      <div className="sd-court-header">
        <div>
          <span className="sd-micro-label">
            FIG. 005 / SPATIAL SCOUTING
          </span>

          <strong>
            {mode === "DENSITY"
              ? "SHOT CONCENTRATION"
              : "SHOT LOCATION MAP"}
          </strong>
        </div>

        <span className="sd-court-header-count">
          {plotted} PLOTTED
        </span>
      </div>

      <div
        className="sd-court-stage sd-interactive-stage"
        onKeyDown={(event) => {
          if (
            event.key === "Escape" &&
            event.target === event.currentTarget
          ) {
            onClear();
          }
        }}
      >
        <svg
          className="sd-court-svg"
          viewBox={`0 0 ${W} ${H}`}
          role="group"
          aria-label={`NBA half court with basket at top. Selected team: ${teamName}`}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              onClear();
            }
          }}
        >
          <defs>
            <linearGradient
              id="sd-maple-base"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#F1D9AF" />
              <stop offset="45%" stopColor="#E9CA99" />
              <stop offset="100%" stopColor="#E4C18C" />
            </linearGradient>

            <pattern
              id="sd-floor-grain"
              width="500"
              height="32"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 0H500M0 16H500M0 32H500"
                stroke="#A77A49"
                strokeWidth="0.85"
                opacity="0.35"
              />

              <path
                d="M85 0V16M310 0V16M190 16V32M420 16V32"
                stroke="#A77A49"
                strokeWidth="0.8"
                opacity="0.3"
              />

              <path
                d="M15 5C100 2 180 9 260 5S410 3 490 7"
                fill="none"
                stroke="#FFF4DB"
                strokeWidth="1"
                opacity="0.55"
              />

              <path
                d="M40 11C130 15 200 8 290 12S420 16 480 12"
                fill="none"
                stroke="#BD905D"
                strokeWidth="0.65"
                opacity="0.22"
              />

              <path
                d="M5 23C95 19 180 28 275 23S405 20 495 26"
                fill="none"
                stroke="#FFF1D2"
                strokeWidth="1"
                opacity="0.48"
              />
            </pattern>

            <linearGradient
              id="sd-court-varnish"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop
                offset="0%"
                stopColor="#FFFFFF"
                stopOpacity="0.12"
              />

              <stop
                offset="50%"
                stopColor="#FFFFFF"
                stopOpacity="0"
              />

              <stop
                offset="100%"
                stopColor="#FFFFFF"
                stopOpacity="0.09"
              />
            </linearGradient>
          </defs>

          <rect
            width={W}
            height={H}
            fill="url(#sd-maple-base)"
          />

          <rect
            width={W}
            height={H}
            fill="url(#sd-floor-grain)"
          />

          <rect
            width={W}
            height={H}
            fill="url(#sd-court-varnish)"
          />

          {logo && (
            <image
              href={logo}
              x="165"
              y="295"
              width="170"
              height="145"
              opacity="0.22"
              preserveAspectRatio="xMidYMid meet"
              pointerEvents="none"
            />
          )}

          <CourtGeometry />

          {mode === "DENSITY" ? (
            <DensityLayer shots={shots} />
          ) : (
            shots.map((shot) => (
              <ShotMarker
                key={eventKey(shot)}
                shot={shot}
                onHover={onHover}
                onLeave={onLeave}
                onSelect={onSelect}
                active={
                  activeShot != null &&
                  eventKey(activeShot) === eventKey(shot)
                }
                pinned={
                  pinnedShot != null &&
                  eventKey(pinnedShot) === eventKey(shot)
                }
              />
            ))
          )}
        </svg>

        {mode === "DOTS" && activeShot && (
          <FloatingInspector
            shot={activeShot}
            pinned={Boolean(pinnedShot)}
            onClose={onClear}
          />
        )}
      </div>

      <div className="sd-court-footer">
        <span>
          {mode === "DOTS"
            ? "HOVER / CLICK / TAP TO INSPECT"
            : "ESPN-DERIVED COORDINATES"}
        </span>

        <span>
          {omitted
            ? `${omitted} OUTSIDE COURT`
            : "ALL POSITIONS IN BOUNDS"}
        </span>
      </div>
    </div>
  );
}

function ShotTooltip({ shot, pinned }) {
  if (!shot) {
    return (
      <div className="sd-hover-empty">
        <span className="sd-micro-label">
          EVENT INSPECTOR
        </span>

        <strong>
          HOVER OR SELECT A SHOT
        </strong>

        <p>
          Hover to preview. Click or tap to pin.
          Select the same shot again to unpin.
        </p>
      </div>
    );
  }

  const result = outcome(shot);

  return (
    <div className="sd-hover-detail">
      <div className="sd-hover-top">
        <span className="sd-micro-label">
          {pinned ? "PINNED EVENT" : "EVENT INSPECTOR"}
        </span>

        <span
          className={`sd-result-pill sd-result-${result.toLowerCase()}`}
        >
          {result}
        </span>
      </div>

      <strong>{shotDescription(shot)}</strong>

      <div className="sd-hover-meta">
        <span>{zoneOf(shot) || "UNCLASSIFIED"}</span>
        <span>{shotTime(shot) || "GAME EVENT"}</span>
      </div>
    </div>
  );
}

function ZonePanel({
  shots,
  activeShot,
  pinned,
  historicalFallback = false,
}) {
  const zones = useMemo(
    () =>
      ZONES.map((name) => {
        const attempts = shots.filter(
          (shot) => zoneOf(shot) === name
        );

        const made = attempts.filter(
          (shot) => outcome(shot) === "MADE"
        ).length;

        return {
          name,
          made,
          attempts: attempts.length,
          efficiency: attempts.length
            ? (made / attempts.length) * 100
            : null,
        };
      }),
    [shots]
  );

  // NBA_DNA_STAGE35_4G_SHOT_PROFILE
  const shotProfile = useMemo(() => {
    const populated = zones.filter((zone) => zone.attempts > 0);
    const eligible = populated.filter((zone) => zone.attempts >= 20);

    const highestEfficiency = [...eligible].sort(
      (a, b) =>
        b.efficiency - a.efficiency ||
        b.attempts - a.attempts
    )[0] || null;

    const highestVolume = [...populated].sort(
      (a, b) =>
        b.attempts - a.attempts ||
        b.made - a.made
    )[0] || null;

    return {
      highestEfficiency,
      highestVolume,
      classifiedAttempts: populated.reduce(
        (sum, zone) => sum + zone.attempts, 0
      ),
      hasSmallSamples: populated.some(
        (zone) => zone.attempts > 0 && zone.attempts < 20
      ),
    };
  }, [zones]);

  return (
    <aside className="sd-intelligence-panel">
      <div className="sd-panel-top">
        <span className="sd-micro-label">
          SHOT EFFICIENCY
        </span>

        <span className="sd-micro-label">
          ACCEPTED-GAME FGA
        </span>
      </div>

      <h3>
        THE GEOGRAPHY
        <br />
        OF SCORING.
      </h3>

      <p className="sd-panel-intro">
        Shot distribution and field-goal efficiency
        by provisional spatial classification.
      </p>

      <div className="sd-zone-list">
        {zones.map((zone, index) => (
          <div
            key={zone.name}
            className="sd-zone-item"
          >
            <div className="sd-zone-top">
              <div>
                <span className="sd-zone-number">
                  0{index + 1}
                </span>

                <strong>{zone.name}</strong>
              </div>

              <strong className="sd-zone-percentage">
                {percentage(zone.made, zone.attempts)}
              </strong>
            </div>

            <div className="sd-zone-sub">
              <span>
                {zone.made} / {zone.attempts} FGM/FGA
              </span>

              <span>
                {zone.attempts
                  ? `${zone.attempts} ATTEMPTS`
                  : "NO ATTEMPTS"}
              </span>
            </div>

            <div className="sd-zone-track">
              {zone.efficiency !== null && (
                <div
                  className="sd-zone-fill"
                  style={{
                    width: `${zone.efficiency}%`,
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="sd-profile-card">
        <div className="sd-profile-eyebrow">
          <span>THE FRONT OFFICE / SHOT INTELLIGENCE</span>
          <span>SCOUTING NOTE</span>
        </div>

        <h4>THE SHOT PROFILE.</h4>

        <div className="sd-profile-metrics">
          <div className="sd-profile-metric">
            <span>HIGHEST ZONE FG% / 20+ FGA</span>
            <strong>
              {shotProfile.highestEfficiency
                ? percentage(
                    shotProfile.highestEfficiency.made,
                    shotProfile.highestEfficiency.attempts
                  )
                : "N/A"}
            </strong>
            <small>
              {shotProfile.highestEfficiency?.name ||
                "INSUFFICIENT ZONE SAMPLE"}
            </small>
            {shotProfile.highestEfficiency && (
              <small>
                {shotProfile.highestEfficiency.attempts} attempts
              </small>
            )}
          </div>

          <div className="sd-profile-metric">
            <span>MOST ATTEMPTED ZONE</span>
            <strong>
              {shotProfile.highestVolume?.attempts ?? "N/A"}
            </strong>
            <small>
              {shotProfile.highestVolume?.name ||
                "NO CLASSIFIED ATTEMPTS"}
            </small>
          </div>
        </div>

        <div className="sd-profile-read">
          <span>THE SCOUTING READ</span>
          {shotProfile.highestEfficiency &&
           shotProfile.highestVolume ? (
            <p>
              Within this partial sample,
              {" "}{shotProfile.highestEfficiency.name.toLowerCase()}
              {" "}has the highest field-goal percentage
              among zones with at least 20 attempts.
              {" "}{shotProfile.highestVolume.name.toLowerCase()}
              {" "}accounts for the most attempts.
            </p>
          ) : (
            <p>
              The available classified shot sample is
              too small for a reliable zone-efficiency
              comparison under the 20-attempt rule.
            </p>
          )}
        </div>

        <p className="sd-profile-disclaimer">
          {historicalFallback
            ? "2024-25 historical fallback"
            : "2025-26 accepted-game sample"}
          {" · "}Partial coverage
          {" · "}Provisional spatial classification.
          {" "}The 20-attempt threshold is a
          descriptive display rule, not a statistical
          significance test.
        </p>
      </div>

      <ShotTooltip
        shot={activeShot}
        pinned={pinned}
      />

      <div className="sd-methodology">
        <div className="sd-methodology-heading">
          <span className="sd-methodology-dot" />
          <strong>DATA VALIDATION STATUS</strong>
        </div>

        <p>
          ESPN play-by-play events from games
          matching both teams official FGM/FGA.
          Player-level reconciliation is pending.
        </p>

        <p>
          2025-26 regular-season sample.
          45 games excluded for reconciliation.
          Player season coverage is incomplete.
        </p>

        <p>
          NBA court geometry is drawn to scale.
          The ESPN coordinate mapping and
          shot-zone classification are provisional.
        </p>

        <p>
          The displayed logo represents the
          selected franchise, not necessarily
          the historical game venue.
        </p>
      </div>
    </aside>
  );
}

export default function ShotDNA({
  selectedPlayer,
  teamColor = "#EF7845",
}) {
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [mode, setMode] = useState("DOTS");

  const [hoveredShot, setHoveredShot] = useState(null);
  const [pinnedShot, setPinnedShot] = useState(null);


  const athleteKey =
    selectedPlayer?.athlete_key == null
      ? ""
      : String(selectedPlayer.athlete_key);

  const teamName = selectedPlayer?.team || "";

  useEffect(() => {
    let active = true;

    setDataset(null);
    setError("");
    setLoading(Boolean(athleteKey));

    if (!athleteKey) {
      return () => {
        active = false;
      };
    }

    async function loadData() {
      try {
        const response = await fetch(
          `${PLAYER_DATA_DIR}/player_${encodeURIComponent(athleteKey)}.json`
        );

        if (!response.ok) {
          throw new Error(
            `Unable to load 2025-26 player shots (${response.status}).`
          );
        }

        const json = await response.json();

        if (!Array.isArray(json.shots)) {
          throw new Error("Invalid player shot dataset.");
        }

        if (active) {
          /* NBA_DNA_UNIFIED_FALLBACK_V1 */
let effectiveDataset = json;
if (Array.isArray(json.shots) &&
    json.shots.length === 0 &&
    ['6606','2991230','6442','3136196','4396993']
      .includes(String(athleteKey))) {
  try {
    const historicalResponse = await fetch(
      `/data/shot_dna_2024_25_map/player_${athleteKey}.json`
    );
    if (historicalResponse.ok) {
      const historical = await historicalResponse.json();
      if (historical.season === '2024-25' &&
          String(historical.athlete_id) === String(athleteKey) &&
          Array.isArray(historical.shots)) {
        effectiveDataset = {
          ...historical,
          athlete_key: String(athleteKey),
          historical_fallback: true,
          shots: historical.shots.map((s) => ({
            ...s,
            result: s.made ? 'MADE' : 'MISSED',
            official_fga: true,
            shooter_espn_id: String(athleteKey),
            season: '2024-25'
          }))
        };
      }
    }
  } catch (historicalError) {
    console.warn('Historical fallback unavailable', historicalError);
  }
}
setDataset(effectiveDataset);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unknown data error."
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
  }, [athleteKey]);

  const playerShots = useMemo(
    () => dataset?.shots || [],
    [dataset]
  );

  const filteredShots = useMemo(
    () =>
      filter === "ALL"
        ? playerShots
        : playerShots.filter(
            (shot) => outcome(shot) === filter
          ),
    [playerShots, filter]
  );

  const made = playerShots.filter(
    (shot) => outcome(shot) === "MADE"
  ).length;

  const missed = playerShots.filter(
    (shot) => outcome(shot) === "MISSED"
  ).length;

  const blocked = playerShots.filter(
    (shot) => outcome(shot) === "BLOCKED"
  ).length;

  const plotted = filteredShots.filter(
    (shot) => shotPoint(shot) !== null
  ).length;

  /*
   * Pinned selection takes precedence over hover.
   */

  const activeShot = pinnedShot || hoveredShot;

  function handleHover(shot) {
    setHoveredShot(shot);
  }

  function handleLeave(shot) {
    setHoveredShot((current) =>
      current && eventKey(current) === eventKey(shot)
        ? null
        : current
    );
  }

  function handleSelect(shot) {
    if (!shot) {
      setPinnedShot(null);
      setHoveredShot(null);
      return;
    }

    setPinnedShot((current) =>
      current && eventKey(current) === eventKey(shot)
        ? null
        : shot
    );

    setHoveredShot(null);
  }

  function clearSelection() {
    setPinnedShot(null);
    setHoveredShot(null);
  }

  // NBA_DNA_STAGE29C1_FILTER_RESET
  useEffect(() => {
    setFilter("ALL");
    setMode("DOTS");
    setPinnedShot(null);
    setHoveredShot(null);
  }, [athleteKey]);

  useEffect(() => {
    setPinnedShot(null);
    setHoveredShot(null);
  }, [athleteKey, filter, mode]);

  return (
    <section
      className="sd-section"
      id="shot-dna"
      style={{ "--sd-team-color": teamColor }}
    >
      <div className="sd-section-topline">
        <span>08 / SPATIAL INTELLIGENCE</span>
        <span>THE SHOT DNA / 19H-K-AH</span>
      </div>

      <div className="sd-heading">
        <div className="sd-heading-copy">
          <p className="sd-eyebrow">
            THE ANATOMY OF A SHOT
          </p>

          <h2>
            THE SHOT
            <br />
            <span>DNA.</span>
          </h2>

          <p className="sd-description">
            The court is a map of decisions.
            Every attempt leaves a trace.
          </p>

          <div className="sd-heading-tags">
            <span>VERIFIED PLAY-BY-PLAY</span>
            <span>{dataset?.historical_fallback ? "2024-25 HISTORICAL SAMPLE" : "2025-26 SEASON SAMPLE"}</span>
            <span>INTERACTIVE SHOT INSPECTOR</span>
          </div>
        </div>

        <div className="sd-player-card">
          <span className="sd-micro-label">
            SELECTED PLAYER
          </span>

          <strong>
            {selectedPlayer?.player ||
              "NO PLAYER SELECTED"}
          </strong>

          <span>
            {teamName || "THE FRONT OFFICE"}
          </span>

          <div className="sd-player-card-rule" />

          <small>
            ESPN ID / {athleteKey || "UNAVAILABLE"}
          </small>
        </div>
      </div>

      <RookiePreseasonProfile athleteKey={athleteKey} />

      

      {loading && (
        <div className="sd-empty-state">
          <strong>LOADING SHOT INTELLIGENCE</strong>
          <p>Loading accepted 2025-26 player events...</p>
        </div>
      )}

      {error && (
        <div className="sd-empty-state sd-error">
          <strong>DATA LOAD ERROR</strong>
          <p>{error}</p>
        </div>
      )}

      {!loading &&
        !error &&
        dataset?.athlete_key === athleteKey &&
        playerShots.length === 0 && (
          <div className="sd-empty-state">
            <span className="sd-empty-index">
              DATA COVERAGE / 001
            </span>

            <strong>NO VERIFIED SHOT DATA</strong>

            <p>
              No shots are available for this player
              in the accepted 2025-26 game set.
              This does not mean zero official attempts.
              Unreconciled games remain excluded.
            </p>
          </div>
        )}

      {!loading &&
        !error &&
        dataset?.athlete_key === athleteKey &&
        playerShots.length > 0 && (
          <>
            <div className="sd-summary">
              <div>
                <small>FIELD GOAL ATTEMPTS</small>
                <strong>{playerShots.length}</strong>
                <span>ACCEPTED-GAME FGA</span>
              </div>

              <div>
                <small>FIELD GOALS MADE</small>
                <strong>{made}</strong>
                <span>ACCEPTED-GAME FGM</span>
              </div>

              <div>
                <small>FIELD GOAL %</small>
                <strong>
                  {percentage(made, playerShots.length)}
                </strong>
                <span>PARTIAL SEASON SAMPLE</span>
              </div>

              <div>
                <small>SHOT OUTCOMES</small>
                <strong>{missed + blocked}</strong>
                <span>
                  MISSED FGA / {blocked} BLOCKED
                </span>
              </div>
            </div>

            <div className="sd-toolbar">
              <div className="sd-filter-controls">
                <span className="sd-toolbar-label">
                  FILTER BY RESULT
                </span>

                <div className="sd-button-group">
                  {FILTERS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={
                        filter === item ? "active" : ""
                      }
                      aria-pressed={filter === item}
                      onClick={() => setFilter(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sd-view-controls">
                <span className="sd-toolbar-label">
                  VISUALIZATION
                </span>

                <div className="sd-button-group">
                  <button
                    type="button"
                    className={
                      mode === "DOTS" ? "active" : ""
                    }
                    aria-pressed={mode === "DOTS"}
                    onClick={() => setMode("DOTS")}
                  >
                    SHOT MAP
                  </button>

                  <button
                    type="button"
                    className={
                      mode === "DENSITY" ? "active" : ""
                    }
                    aria-pressed={mode === "DENSITY"}
                    onClick={() => setMode("DENSITY")}
                  >
                    SHOT DENSITY
                  </button>
                </div>
              </div>
            </div>

                        {dataset?.historical_fallback ? (
  <div className="sd-source-line" style={{
    padding: "18px",
    background: "#14202d",
    color: "#f4f7fb",
    borderRadius: "10px",
    marginBottom: "18px"
  }}>
    <strong>2024–25 REGULAR SEASON · HISTORICAL FALLBACK</strong>
    <p>PARTIAL COVERAGE · ESPN COORDINATES PROVISIONAL</p>
    <p>Historical shots are not mixed with 2025–26 data.</p>
    <p>Out-of-half-court events are excluded from this map.</p>
  </div>
) : (
  <ShotDNAProvenance dataset={dataset} />
)}


            <div className="sd-content-grid">
              <ShotCourt
                shots={filteredShots}
                mode={mode}
                activeShot={activeShot}
                pinnedShot={pinnedShot}
                onHover={handleHover}
                onLeave={handleLeave}
                onSelect={handleSelect}
                onClear={clearSelection}
                teamName={teamName}
              />

              <ZonePanel
                shots={playerShots}
                activeShot={activeShot}
                pinned={Boolean(pinnedShot)}
                historicalFallback={Boolean(dataset?.historical_fallback)}
              />
            </div>

            <div className="sd-bottom-strip">
              <div className="sd-legend">
                <span>
                  <i className="sd-dot-made" />
                  MADE / {made}
                </span>

                <span>
                  <i className="sd-dot-missed" />
                  MISSED / {missed}
                </span>

                <span>
                  <i className="sd-dot-blocked" />
                  BLOCKED / {blocked}
                </span>
              </div>

              <div className="sd-display-count">
                DISPLAYING {plotted} OF{" "}
                {filteredShots.length} FILTERED EVENTS
              </div>
            </div>

            <p className="sd-source-line">
              {dataset?.historical_fallback  ? "SOURCE: ESPN 2024-25 REGULAR SEASON / PLAYER-GAME RECONCILED SAMPLE / PARTIAL COVERAGE / SPATIAL MAPPING PROVISIONAL"  : "SOURCE: ESPN 2025-26 GAME SUMMARIES / 1185 TEAM-RECONCILED GAMES / 45 GAMES EXCLUDED / PLAYER AUDIT PENDING / SPATIAL MAPPING PROVISIONAL"}
            </p>
          </>
        )}
    </section>
  );
}