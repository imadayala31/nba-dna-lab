import "./Experiments35.css";

import { useEffect, useMemo, useState } from "react";
import "./App.css";
import "./Stage29Editorial.css";
import "./Stage29Thread.css";

import LivingCourt from "./LivingCourt";
import AbsenceRipple from "./AbsenceRipple";
import PlayerDNA from "./PlayerDNA";
import BlindPlayerTest from "./BlindPlayerTest";
import ShotDNA from "./ShotDNA";
import HiddenTwin from "./HiddenTwin"; // NBA_DNA_STAGE30B1
import EvidenceRoom from "./EvidenceRoom"; // NBA_DNA_STAGE32B2
import WarRoom from "./WarRoom"; // NBA_DNA_STAGE33_3_FIX
import NextChapter from "./NextChapter";
import CommandBar from "./CommandBar";

const TEAM_INFO = {
  "Atlanta Hawks": { code: "atl", color: "#C8102E" },
  "Boston Celtics": { code: "bos", color: "#007A33" },
  "Brooklyn Nets": { code: "bkn", color: "#303030" },
  "Charlotte Hornets": { code: "cha", color: "#00788C" },
  "Chicago Bulls": { code: "chi", color: "#CE1141" },
  "Cleveland Cavaliers": { code: "cle", color: "#860038" },
  "Dallas Mavericks": { code: "dal", color: "#00538C" },
  "Denver Nuggets": { code: "den", color: "#0E2240" },
  "Detroit Pistons": { code: "det", color: "#C8102E" },
  "Golden State Warriors": { code: "gs", color: "#1D428A" },
  "Houston Rockets": { code: "hou", color: "#CE1141" },
  "Indiana Pacers": { code: "ind", color: "#002D62" },
  "Los Angeles Clippers": { code: "lac", color: "#C8102E" },
  "LA Clippers": { code: "lac", color: "#C8102E" },
  "Los Angeles Lakers": { code: "lal", color: "#552583" },
  "Memphis Grizzlies": { code: "mem", color: "#5D76A9" },
  "Miami Heat": { code: "mia", color: "#98002E" },
  "Milwaukee Bucks": { code: "mil", color: "#00471B" },
  "Minnesota Timberwolves": { code: "min", color: "#0C2340" },
  "New Orleans Pelicans": { code: "no", color: "#0C2340" },
  "New York Knicks": { code: "ny", color: "#006BB6" },
  "Oklahoma City Thunder": { code: "okc", color: "#007AC1" },
  "Orlando Magic": { code: "orl", color: "#0077C0" },
  "Philadelphia 76ers": { code: "phi", color: "#006BB6" },
  "Phoenix Suns": { code: "phx", color: "#E56020" },
  "Portland Trail Blazers": { code: "por", color: "#E03A3E" },
  "Sacramento Kings": { code: "sac", color: "#5A2D81" },
  "San Antonio Spurs": { code: "sa", color: "#555555" },
  "Toronto Raptors": { code: "tor", color: "#CE1141" },
  "Utah Jazz": { code: "utah", color: "#4B2B7F" },
  "Washington Wizards": { code: "wsh", color: "#002B5C" },
};

const DATA_COLORS = {
  returning: "#26A69A",
  incoming: "#EF7845",
  noRecent: "#4263CE",
};

function asNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatPct(value) {
  return `${asNumber(value).toFixed(1)}%`;
}

function isStarter(value) {
  return (
    value === true ||
    value === 1 ||
    value === "1" ||
    String(value).toLowerCase() === "true"
  );
}

function getTeamInfo(name) {
  return (
    TEAM_INFO[name] || {
      code: "",
      color: "#334155",
    }
  );
}

function getInitials(name) {
  return String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function sortRotation(players) {
  return [...players].sort(
    (a, b) =>
      Number(isStarter(b.projected_starter)) -
        Number(isStarter(a.projected_starter)) ||
      asNumber(b.projected_mpg) -
        asNumber(a.projected_mpg)
  );
}

function TeamLogo({ team, large = false }) {
  const [failed, setFailed] = useState(false);
  const info = getTeamInfo(team);

  const src = info.code
    ? `https://a.espncdn.com/i/teamlogos/nba/500/${info.code}.png`
    : "";

  return (
    <span
      className={`team-logo ${
        large ? "team-logo-large" : ""
      }`}
      aria-label={`${team} logo`}
    >
      {src && !failed ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="team-logo-fallback">
          {getInitials(team)}
        </span>
      )}
    </span>
  );
}

function PlayerPhoto({ player }) {
  const [failed, setFailed] = useState(false);
  const historicalHeadshots = {
  "6606": "/images/players/espn_6606.png",
  "2991230": "/images/players/espn_2991230.png",
  "6442": "/images/players/espn_6442.png",
  "3136196": "/images/players/espn_3136196.png",
  "4396993": "/images/players/espn_4396993.png",
  /* NBA_DNA_ROOKIE_PORTRAITS_V1 */
  "5101761": "/images/players/espn_5101761.png",
  "5095151": "/images/players/espn_5095151.png",
  "4873153": "/images/players/espn_4873153.png",
  "5175737": "/images/players/espn_5175737.png",
  "5041935": "/images/players/espn_5041935.png",
  "5142620": "/images/players/espn_5142620.png",
  "5041955": "/images/players/espn_5041955.png",
  "5142718": "/images/players/espn_5142718.png"
};
const localHeadshot = historicalHeadshots[
  String(player.athlete_key ?? '')
];
const url = localHeadshot || player.headshot_url;

  return (
    <div className="player-photo">
      {url && !failed ? (
        <img
          src={url}
          alt={player.player}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="player-initials">
          {getInitials(player.player)}
        </span>
      )}
    </div>
  );
}

function StackedBar({ team }) {
  const parts = [
    {
      value: asNumber(team.returning_minutes_share_pct),
      color: DATA_COLORS.returning,
    },
    {
      value: asNumber(team.incoming_minutes_share_pct),
      color: DATA_COLORS.incoming,
    },
    {
      value: asNumber(
        team.no_recent_history_minutes_share_pct
      ),
      color: DATA_COLORS.noRecent,
    },
  ];

  return (
    <div
      className="stacked-bar"
      role="img"
      aria-label={
        `${team.team}: ` +
        `${formatPct(parts[0].value)} returning, ` +
        `${formatPct(parts[1].value)} incoming, ` +
        `${formatPct(parts[2].value)} no recent NBA games`
      }
    >
      {parts.map((part, index) => (
        <span
          key={index}
          style={{
            width: `${part.value}%`,
            backgroundColor: part.color,
          }}
        />
      ))}
    </div>
  );
}

function PlayerStatus({ player }) {
  const status = String(
    player.roster_evolution_status || ""
  ).toUpperCase();

  if (
    status.includes("NO_2025") ||
    status.includes("NO_RECENT")
  ) {
    return (
      <span className="status status-new">
        NO RECENT GAMES
      </span>
    );
  }

  if (status.includes("INCOMING")) {
    return (
      <span className="status status-incoming">
        INCOMING
      </span>
    );
  }

  return (
    <span className="status status-returning">
      RETURNING
    </span>
  );
}

function EditorialCourt() {
  return (
    <div className="court-feature">
      <div className="court-feature-top">
        <span>THE FRONT OFFICE</span>
        <span>FIG. 001 / THE 82-GAME ILLUSION</span>
      </div>

      <svg
        className="court-drawing"
        viewBox="0 0 620 590"
        role="img"
        aria-label="Minimal architectural illustration of a basketball half court"
      >
        <rect
          x="30"
          y="28"
          width="560"
          height="530"
          fill="#F8F7F4"
          stroke="#69747C"
          strokeWidth="1.8"
        />

        <path
          d="M30 558 H590"
          fill="none"
          stroke="#69747C"
          strokeWidth="1.8"
        />

        <path
          d="M205 28 V235 H415 V28"
          fill="none"
          stroke="#69747C"
          strokeWidth="1.8"
        />

        <circle
          cx="310"
          cy="235"
          r="105"
          fill="none"
          stroke="#69747C"
          strokeWidth="1.8"
        />

        <path
          d="M30 175 H85 A225 225 0 0 0 535 175 H590"
          fill="none"
          stroke="#69747C"
          strokeWidth="1.8"
        />

        <path
          d="M275 75 H345"
          stroke="#69747C"
          strokeWidth="3"
        />

        <circle
          cx="310"
          cy="90"
          r="12"
          fill="none"
          stroke="#69747C"
          strokeWidth="2"
        />

        <path
          d="M245 558 A65 65 0 0 1 375 558"
          fill="none"
          stroke="#69747C"
          strokeWidth="1.8"
        />

        <text
          x="310"
          y="405"
          textAnchor="middle"
          className="court-number"
        >
          82
        </text>

        <text
          x="310"
          y="442"
          textAnchor="middle"
          className="court-small-text"
        >
          GAMES ON THE SCHEDULE
        </text>
      </svg>

      <div className="court-feature-bottom">
        <span>THE COURT IS CONSTANT.</span>
        <span>THE ROSTER IS NOT.</span>
      </div>
    </div>
  );
}

export default function App() {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);

  const [selectedName, setSelectedName] =
    useState("");

  const [selectedPlayerName, setSelectedPlayerName] =
    useState("");

  // NBA_DNA_STAGE35_4E_INTERACTIVE_SCOUTING
  const [expandedScout, setExpandedScout] =
    useState(null);

  const [selectionEvent, setSelectionEvent] =
    useState(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [teamsResponse, playersResponse] =
          await Promise.all([
            fetch("/data/front_office_teams_19a.json"),
            fetch("/data/front_office_players_19a.json"),
          ]);

        if (
          !teamsResponse.ok ||
          !playersResponse.ok
        ) {
          throw new Error(
            "The team or player data could not be loaded. Check public/data."
          );
        }

        const [teamData, playerData] =
          await Promise.all([
            teamsResponse.json(),
            playersResponse.json(),
          ]);

        if (
          !Array.isArray(teamData) ||
          !Array.isArray(playerData)
        ) {
          throw new Error(
            "The JSON data format is invalid."
          );
        }

        const sorted = [...teamData].sort(
          (a, b) =>
            asNumber(b.projected_roster_change_pct) -
            asNumber(a.projected_roster_change_pct)
        );

        const firstTeam = sorted[0]?.team || "";

        const firstPlayer = sortRotation(
          playerData.filter(
            (player) => player.team === firstTeam
          )
        )[0];

        if (!active) return;

        setTeams(sorted);
        setPlayers(playerData);
        setSelectedName(firstTeam);
        setSelectedPlayerName(
          firstPlayer?.player || ""
        );
        setError("");
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load data."
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

  const selectedTeam = teams.find(
    (team) => team.team === selectedName
  );

  const selectedPlayers = useMemo(
    () =>
      sortRotation(
        players.filter(
          (player) => player.team === selectedName
        )
      ),
    [players, selectedName]
  );

  const selectedPlayer = useMemo(
    () =>
      players.find(
        (player) =>
          player.team === selectedName &&
          player.player === selectedPlayerName
      ) || null,
    [players, selectedName, selectedPlayerName]
  );

  const leagueAverage = useMemo(() => {
    if (!teams.length) return 0;

    return (
      teams.reduce(
        (sum, team) =>
          sum +
          asNumber(team.projected_roster_change_pct),
        0
      ) / teams.length
    );
  }, [teams]);

  const selectedInfo = getTeamInfo(selectedName);

  function handleTeamSelect(teamName) {
    const nextPlayers = sortRotation(
      players.filter(
        (player) => player.team === teamName
      )
    );

    setSelectedName(teamName);
    setSelectedPlayerName(
      nextPlayers[0]?.player || ""
    );
    setSelectionEvent(null);
  }

  function handleSharedPlayerSelect(
    player,
    source,
    options = {}
  ) {
    const playerName =
      typeof player === "string"
        ? player
        : player?.player || player?.name;

    const playerTeam =
      typeof player === "string"
        ? selectedName
        : player?.team || selectedName;

    if (!playerName || !playerTeam) return;

    const exists = players.some(
      (item) =>
        item.team === playerTeam &&
        item.player === playerName
    );

    if (!exists) return;

    if (playerTeam !== selectedName) {
      setSelectedName(playerTeam);
    }

    setSelectedPlayerName(playerName);

    setSelectionEvent({
      team: playerTeam,
      player: playerName,
      source,
      scrollToRipple:
        source === "court" &&
        options.scrollToRipple !== false,
      id: Date.now() + Math.random(),
    });
  }

  // NBA_DNA_STAGE35_4E1_SMART_SCOUTING_NAV
  useEffect(() => {
    if (!expandedScout ||
        expandedScout.team !== selectedName) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const target = document.querySelector(
        ".rotation-section .scout-file"
      );

      if (!target) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start"
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [expandedScout, selectedName]);

  function handleCourtPlayerSelect(
    player,
    options
  ) {
    handleSharedPlayerSelect(
      player,
      "court",
      options
    );
  }

  function handleRipplePlayerSelect(player) {
    handleSharedPlayerSelect(player, "ripple");
  }

  function handleDNAPlayerSelect(player) {
    handleSharedPlayerSelect(player, "dna");
  }

  return (
    <div className="site" id="top">
      <header className="site-header">
        <a href="#top" className="site-brand">
          NBA DNA LAB<span>.</span>
        </a>

        <div className="header-meta">
          <span>THE FRONT OFFICE</span>
          <span className="header-season">
            2026–27 PRESEASON
          </span>
        </div>
      </header>

      {/* NBA_DNA_STAGE35_1_COMMAND_BAR */}
      <CommandBar
        teams={teams}
        selectedName={selectedName}
        onTeamSelect={handleTeamSelect}
      />


      <main>
        <section className="hero">
          <div className="hero-topline">
            <span>
              ARTICLE 001 / BASKETBALL INTELLIGENCE
            </span>
            <span>
              AN INDEPENDENT RESEARCH PROJECT
            </span>
          </div>

          <div className="hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">
                <span className="eyebrow-line" />
                CHAPTER 01 / THE INTRODUCTION
              </p>

              <h1>
                THE
                <br />
                <span>82-GAME</span>
                <br />
                ILLUSION
                <span className="orange-dot">.</span>
              </h1>

              <p className="hero-lead">
                82 games. Thousands of possessions.
                <br />
                <strong>
                  One box score never tells the whole story.
                </strong>
              </p>

              <div className="stage29-story">
                <p className="hero-description">
                  Two players can average the same points and
                  play completely different games. A shot chart
                  can reveal what a scoring average hides.
                  One missing starter can change the roles
                  of an entire rotation.
                </p>
                <p className="stage29-tools">
                  Compare players beyond the box score.
                  Trace where their shots come from.
                  Explore team rosters, follow how minutes
                  shift when someone is out, and bring those
                  pieces together before a matchup.
                </p>
                <p className="stage29-signature">
                  The numbers are here.
                  <strong> The basketball is in how you read them.</strong>
                </p>
              </div>

              <div className="author-credit">
                <span className="author-rule" />

                <div>
                  <small>
                    RESEARCH, ANALYSIS & DESIGN
                  </small>
                  <strong>
                    EDUARDO IMAD AYALA GARCÍA
                  </strong>
                </div>
              </div>

              <a
                className="primary-link"
                href="#stage29-challenge"
              >
                TAKE THE CHALLENGE <span>↘</span>
              </a>
            </div>

            {/* NBA_DNA_STAGE35_4F_FINAL_COVER */}
<div className="fo-cover-visual">
  <div className="fo-cover-photo">
    <img
      src="/images/nba-court-cover.jpg"
      alt="NBA center-court logo on a hardwood basketball floor"
      loading="eager"
      fetchPriority="high"
    />
    <div className="fo-cover-photo-top">
      <span>THE FRONT OFFICE / VISUAL RESEARCH</span>
      <span>FIG. 001</span>
    </div>
    <div className="fo-cover-photo-bottom">
      <span>THE GAME IS MORE THAN THE BOXSCORE.</span>
      <span>NBA DNA LAB / 2026–27</span>
    </div>
  </div>
  <div className="fo-cover-photo-caption">
    <span>01 / BASKETBALL INTELLIGENCE</span>
    <strong>LOOK CLOSER. THINK DIFFERENTLY.</strong>
  </div>
</div>
          </div>

                    {/* NBA_DNA_STAGE35_4F_EXPERIENCE_INDEX */}
          <nav className="fo-cover-experiences" aria-label="Explore basketball analysis">
            <div className="fo-cover-experiences-heading">
              <span>YOUR SCOUTING STARTS HERE</span>
              <strong>ONE GAME. MORE WAYS TO UNDERSTAND IT.</strong>
            </div>
            <div className="fo-cover-experiences-links">
              <a href="#stage35-rotation"><span>01</span> ROSTER & ROTATION <b>↗</b></a>
              <a href="#stage35-absence"><span>02</span> ABSENCE IMPACT <b>↗</b></a>
              <a href="#stage35-shots"><span>03</span> SHOT DNA <b>↗</b></a>
              <a href="#stage35-twin"><span>04</span> HIDDEN TWIN <b>↗</b></a>
              <a href="#stage35-evidence"><span>05</span> EVIDENCE ROOM <b>↗</b></a>
              <a href="#stage35-war"><span>06</span> WAR ROOM <b>↗</b></a>
            </div>
          </nav>

          <div className="hero-metrics">
            <div>
              <strong>30</strong>
              <span>NBA TEAMS</span>
            </div>

            <div>
              <strong>270</strong>
              <span>PROJECTED PLAYERS</span>
            </div>

            <div>
              <strong>150</strong>
              <span>PROJECTED STARTERS</span>
            </div>

            <div>
              <strong>82</strong>
              <span>TEAM GAMES</span>
            </div>
          </div>
        </section>

        {/* NBA_DNA_STAGE29A */}
        <section
          className="stage29-challenge"
          id="stage29-challenge"
          aria-labelledby="stage29-challenge-title"
        >
          <div className="stage29-challenge-inner">
            <div className="stage29-challenge-top">
              <span>02 / THE CHALLENGE</span>
              <span>BEFORE YOU ENTER THE LAB</span>
            </div>
            <h2 id="stage29-challenge-title">
              THINK YOU <em>KNOW BALL?</em>
            </h2>
            <p className="stage29-challenge-lead">
              Before you analyze the numbers, compare
              the players, or explore the game,
              prove your basketball instincts.
            </p>
            <p className="stage29-challenge-detail">
              Two mystery players. A few clues.
              No names, no reputations.
              Make your pick. Flip the cards.
              See if you really know ball.
            </p>
            <div className="stage29-challenge-bottom">
              <span>THE BLIND PLAYER TEST</span>
              <span aria-hidden="true">↓</span>
            </div>
          </div>
        </section>

        {/* NBA_DNA_STAGE35_1_BLIND */}
        <div id="stage35-blind" />
        <BlindPlayerTest onPlayerSelect={(player) => handleSharedPlayerSelect(player, "blind")} />

        {/* NBA_DNA_STAGE29B / CHAPTER 03 / NBA_DNA_STAGE29B1 */}
        <section className="dna-thread dna-thread-light" aria-labelledby="dna-thread-atlas">
          <div className="dna-thread-inner">
            <span className="dna-thread-index">THE DNA THREAD / LEAGUE</span>
            <h2 id="dna-thread-atlas">YOU MADE YOUR PICK. <em>NOW GO DEEPER.</em></h2>
            <p>A few numbers can start a debate. The full picture takes more work. Start with the league: explore the teams, their projected rotations, and the players behind every roster decision.</p>
            <a className="dna-thread-link" href="#roster-shockwave">EXPLORE THE LEAGUE <span aria-hidden="true">↘</span></a>
          </div>
        </section>

        <section
          className="analysis-section"
          id="roster-shockwave"
          /* NBA_DNA_STAGE35_4B_FRANCHISE_IDENTITY */
          style={{
            "--shockwave-team-color": selectedInfo.color,
          }}
        >
          <div className="section-topline">
            <span>
              04 / LEAGUE INTELLIGENCE
            </span>
            <span>
              30 FRANCHISES / ONE LEAGUE
            </span>
          </div>

          <div className="section-heading">
            <div>
              <div className="shockwave-franchise-label">
                <TeamLogo
                  key={selectedName}
                  team={selectedName}
                />
                <span>
                  {selectedName || "NBA FRANCHISE"}
                </span>
                <span className="shockwave-franchise-season">
                  2026–27 / PROJECTED
                </span>
              </div>
              <h2>
                THE ROSTER
                <br />
                <span>SHOCKWAVE.</span>
              </h2>

              <p>
                How much of each projected rotation
                is allocated to players who did not
                play for the same team in 2025–26,
                or who had no NBA games that season?
              </p>
            </div>

            <div className="average-card">
              <small>LEAGUE AVERAGE</small>
              <strong>
                {formatPct(leagueAverage)}
              </strong>
              <span>
                PROJECTED ROSTER CHANGE
              </span>
            </div>
          </div>

          <div className="legend">
            <span>
              <i
                style={{
                  background: DATA_COLORS.returning,
                }}
              />
              RETURNING
            </span>

            <span>
              <i
                style={{
                  background: DATA_COLORS.incoming,
                }}
              />
              INCOMING
            </span>

            <span>
              <i
                style={{
                  background: DATA_COLORS.noRecent,
                }}
              />
              NO 2025–26 NBA GAMES
            </span>
          </div>

          {loading && (
            <p>Loading league intelligence...</p>
          )}

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          <div className="analysis-grid">
            <div className="ranking">
              <div className="ranking-heading">
                <span>FRANCHISE</span>
                <span>PROJECTED MINUTES</span>
                <span>CHANGE</span>
              </div>

              {teams.map((team, index) => (
                <button
                  key={team.team}
                  type="button"
                  className={`team-row ${
                    selectedName === team.team
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleTeamSelect(team.team)
                  }
                  aria-pressed={
                    selectedName === team.team
                  }
                >
                  <span className="rank-number">
                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}
                  </span>

                  <TeamLogo team={team.team} />

                  <span className="ranking-team-name">
                    {team.team}
                  </span>

                  <StackedBar team={team} />

                  <strong className="ranking-value">
                    {formatPct(
                      team.projected_roster_change_pct
                    )}
                  </strong>
                </button>
              ))}
            </div>

            <aside
              className="team-panel"
              style={{
                "--team-color": selectedInfo.color,
              }}
            >
              {selectedTeam ? (
                <>
                  <div className="team-panel-top">
                    <span>TEAM INTELLIGENCE</span>
                    <span>2026–27</span>
                  </div>

                  <div className="team-panel-identity">
                    <TeamLogo
                      key={selectedName}
                      team={selectedName}
                      large
                    />
                    <h3>{selectedName}</h3>
                  </div>

                  <div className="team-color-rule" />

                  <div className="team-big-stat">
                    <strong>
                      {formatPct(
                        selectedTeam.projected_roster_change_pct
                      )}
                    </strong>
                    <span>
                      PROJECTED ROSTER CHANGE
                    </span>
                  </div>

                  <StackedBar team={selectedTeam} />

                  <div className="team-breakdown">
                    <div>
                      <span>
                        <i
                          style={{
                            background:
                              DATA_COLORS.returning,
                          }}
                        />
                        RETURNING MINUTES
                      </span>
                      <strong>
                        {formatPct(
                          selectedTeam.returning_minutes_share_pct
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        <i
                          style={{
                            background:
                              DATA_COLORS.incoming,
                          }}
                        />
                        INCOMING MINUTES
                      </span>
                      <strong>
                        {formatPct(
                          selectedTeam.incoming_minutes_share_pct
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        <i
                          style={{
                            background:
                              DATA_COLORS.noRecent,
                          }}
                        />
                        NO RECENT NBA GAMES
                      </span>
                      <strong>
                        {formatPct(
                          selectedTeam.no_recent_history_minutes_share_pct
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="roster-counts">
                    <div>
                      <strong>
                        {selectedTeam.returning_players}
                      </strong>
                      <span>RETURNING</span>
                    </div>

                    <div>
                      <strong>
                        {selectedTeam.incoming_players}
                      </strong>
                      <span>INCOMING</span>
                    </div>

                    <div>
                      <strong>
                        {
                          selectedTeam.no_recent_history_players
                        }
                      </strong>
                      <span>NO RECENT</span>
                    </div>
                  </div>

                  <p className="panel-disclaimer">
                    Projected minute allocation,
                    not a forecast of availability
                    or team wins.
                  </p>
                </>
              ) : (
                <p>
                  Select a team to explore
                  its rotation.
                </p>
              )}
            </aside>
          </div>

          {selectedTeam && (
            <section
              className="rotation-section"
              style={{
                "--team-color": selectedInfo.color,
              }}
            >
              <div className="rotation-heading">
                <div>
                  <p className="rotation-eyebrow">
                    05 / PROJECTED ROTATION
                  </p>

                  <h2>
                    THE PEOPLE BEHIND THE PLAN.
                  </h2>

                  <p>
                    {selectedName} /{" "}
                    {selectedPlayers.length}{" "}
                    projected rotation players.
                    Minutes are preseason
                    allocations, not availability
                    predictions.
                  </p>
                </div>

                <TeamLogo
                  key={`rotation-${selectedName}`}
                  team={selectedName}
                  large
                />
              </div>

              <div
                className="player-grid"
                id="rotation-player-grid"
              >
                {selectedPlayers.map((player) => (
                  <article
                    className={
                      "player-card scout-clickable" +
                      (expandedScout?.team === selectedName &&
                      expandedScout?.player === player.player
                        ? " scout-selected"
                        : "")
                    }
                    key={
                      player.athlete_key ||
                      player.player
                    }
                    role="button"
                    tabIndex={0}
                    aria-label={`Open scouting file for ${player.player}`}
                    aria-expanded={
                      expandedScout?.team === selectedName &&
                      expandedScout?.player === player.player
                    }
                    onClick={() => {
                      const isOpen =
                        expandedScout?.team === selectedName &&
                        expandedScout?.player === player.player;

                      setExpandedScout(
                        isOpen
                          ? null
                          : {
                              team: selectedName,
                              player: player.player
                            }
                      );

                      if (!isOpen) {
                        handleSharedPlayerSelect(
                          player,
                          "rotation"
                        );
                      }
                    }}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" ||
                        event.key === " "
                      ) {
                        event.preventDefault();
                        event.currentTarget.click();
                      }
                    }}
                  >
                    <div className="player-card-photo">
                      <PlayerPhoto
                        key={
                          player.athlete_key ||
                          player.player
                        }
                        player={player}
                      />

                      {isStarter(
                        player.projected_starter
                      ) && (
                        <span className="starter-tag">
                          PROJECTED STARTER
                        </span>
                      )}
                    </div>

                    <div className="player-card-body">
                      <span className="player-position">
                        {player.primary_position ||
                          "ROTATION"}
                      </span>

                      <h3>{player.player}</h3>

                      <div className="player-card-bottom">
                        <div className="player-minutes">
                          <strong>
                            {asNumber(
                              player.projected_mpg
                            ).toFixed(1)}
                          </strong>
                          <span>PROJECTED MPG</span>
                        </div>

                        <PlayerStatus player={player} />
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* NBA_DNA_STAGE35_4E_INTERACTIVE_SCOUTING */}
              {expandedScout?.team === selectedName &&
                selectedPlayers
                  .filter(
                    (player) =>
                      player.player === expandedScout.player
                  )
                  .map((player) => (
                    <section
                      className="scout-file"
                      key={`scout-${player.athlete_key || player.player}`}
                      aria-label={`Scouting file for ${player.player}`}
                    >
                      <div className="scout-file-topline">
                        <span>
                          THE FRONT OFFICE / PLAYER FILE
                        </span>
                        <div className="scout-file-actions">
                          <button
                            type="button"
                            className="scout-file-back"
                            onClick={() => {
                              const reduceMotion =
                                window.matchMedia(
                                  "(prefers-reduced-motion: reduce)"
                                ).matches;

                              document
                                .getElementById("rotation-player-grid")
                                ?.scrollIntoView({
                                  behavior: reduceMotion
                                    ? "auto"
                                    : "smooth",
                                  block: "start"
                                });
                            }}
                          >
                            ↑ ALL PLAYERS
                          </button>
                        <button
                          type="button"
                          className="scout-file-close"
                          onClick={() => setExpandedScout(null)}
                          aria-label="Close scouting file"
                        >
                          CLOSE ×
                        </button>
                        </div>
                      </div>

                      <div className="scout-file-main">
                        <div className="scout-file-photo">
                          <PlayerPhoto player={player} />
                        </div>

                        <div className="scout-file-content">
                          <span className="scout-file-eyebrow">
                            PROJECTED ROTATION / 2026–27
                          </span>

                          <h3>{player.player}</h3>

                          <p className="scout-file-team">
                            {selectedName}
                            {" / "}
                            {player.primary_position || "ROTATION"}
                          </p>

                          <div className="scout-file-metrics">
                            <div>
                              <span>PROJECTED MPG</span>
                              <strong>
                                {asNumber(
                                  player.projected_mpg
                                ).toFixed(1)}
                              </strong>
                            </div>

                            <div>
                              <span>ROTATION ROLE</span>
                              <strong>
                                {isStarter(
                                  player.projected_starter
                                )
                                  ? "STARTER"
                                  : "ROTATION"}
                              </strong>
                            </div>

                            <div>
                              <span>ROSTER STATUS</span>
                              <div className="scout-file-status">
                                <PlayerStatus player={player} />
                              </div>
                            </div>
                          </div>

                          <p className="scout-file-note">
                            Projected minutes describe a
                            preseason allocation, not a
                            prediction of player availability.
                          </p>

                          <button
                            type="button"
                            className="scout-file-dna"
                            onClick={() => {
                              handleSharedPlayerSelect(
                                player,
                                "rotation"
                              );

                              document
                                .getElementById("stage35-player")
                                ?.scrollIntoView({
                                  behavior: window.matchMedia(
                                    "(prefers-reduced-motion: reduce)"
                                  ).matches
                                    ? "auto"
                                    : "smooth",
                                  block: "start"
                                });
                            }}
                          >
                            EXPLORE PLAYER DNA
                            <span aria-hidden="true">↗</span>
                          </button>
                        </div>
                      </div>
                    </section>
                  ))}

              {selectedPlayers.length === 0 && (
                <p className="empty-players">
                  No player records match this
                  team name. Check the team
                  field in the player JSON.
                </p>
              )}
            </section>
          )}

          {/* NBA DNA THREAD / CHAPTER 04 */}
          <div className="dna-thread dna-thread-steel" id="dna-thread-court">
            <div className="dna-thread-inner">
              <span className="dna-thread-index">THE DNA THREAD / ROTATION</span>
              <h2>THE ROSTER IS A PLAN. <em>THE GAME CHANGES IT.</em></h2>
              <p>Explore the players on the court. Then test what happens to a rotation when one of them is unavailable. Follow the minutes, not just the names.</p>
              <span className="dna-thread-footnote">Hypothetical scenarios, not injury or performance forecasts.</span>
            </div>
          </div>

          <div id="stage35-rotation" />
          {selectedTeam && (
            <LivingCourt
              key={selectedName}
              team={selectedName}
              players={selectedPlayers}
              teamColor={selectedInfo.color}
              selectedPlayerName={
                selectedPlayerName
              }
              onPlayerSelect={
                handleCourtPlayerSelect
              }
            />
          )}

          <div id="stage35-absence" />
          {selectedTeam && (
            <AbsenceRipple
              team={selectedName}
              teamColor={selectedInfo.color}
              selectedPlayerName={
                selectedPlayerName
              }
              selectionEvent={
                selectionEvent
              }
              onPlayerSelect={
                handleRipplePlayerSelect
              }
            />
          )}

          {/*
            NEW ORDER:
            THE SHOT DNA comes immediately
            after the minutes / absence analysis
            and BEFORE PLAYER DNA.
          */}

          {/* NBA DNA THREAD / CHAPTER 05 */}
          <div className="dna-thread dna-thread-light" id="dna-thread-shots">
            <div className="dna-thread-inner">
              <span className="dna-thread-index">THE DNA THREAD / SHOT PROFILE</span>
              <h2>POINTS TELL YOU HOW MANY. <em>SHOT DNA EXPLORES HOW.</em></h2>
              <p>Look beyond a scoring average and investigate the attempts behind it. Shot locations offer another perspective on a a player's offensive identity.</p>
              <span className="dna-thread-footnote">Shot coverage is limited; spatial interpretations are exploratory.</span>
            </div>
          </div>

          <div id="stage35-shots" />
          {selectedTeam && (
            <ShotDNA
              selectedPlayer={selectedPlayer}
              teamColor={selectedInfo.color}
            />
          )}

          {/* NBA DNA THREAD / CHAPTER 06 */}
          <div className="dna-thread dna-thread-navy" id="dna-thread-player">
            <div className="dna-thread-inner">
              <span className="dna-thread-index">THE DNA THREAD / PLAYER</span>
              <h2>EVERY PLAYER HAS <em>A DIFFERENT DNA.</em></h2>
              <p>Now connect the pieces. Explore historical production, per-36 rates, and player comparisons to understand the game behind the name.</p>
              <span className="dna-thread-footnote">Historical statistics describe the past, not guaranteed future performance.</span>
            </div>
          </div>

          <div id="blind-player-dna-target" />
          <div id="stage35-player" />
          {selectedTeam && (
            <PlayerDNA
              team={selectedName}
              teamColor={selectedInfo.color}
              selectedPlayerName={
                selectedPlayerName
              }
              onPlayerSelect={
                handleDNAPlayerSelect
              }
            />
          )}

          {/* NBA_DNA_STAGE35_2_EXPERIMENTS */}
          <div className="exp35-chapter">
            <header className="exp35-intro">
              <div className="exp35-topline">
                <span>THE FRONT OFFICE / RESEARCH DIVISION</span>
                <span>INTERACTIVE LAB / THREE EXPERIENCES</span>
              </div>
              <div className="exp35-intro-content">
                <span className="exp35-eyebrow">BEYOND THE BOXSCORE.</span>
                <p className="exp35-editorial-number">11 / THE EXPERIMENTS</p><h2>THE <em>EXPERIMENTS.</em></h2>
                <p>The numbers are only the beginning. Challenge your assumptions, investigate the evidence, and make the decisions yourself.</p>
              </div>
              <div className="exp35-index">
                <a href="#stage35-twin"><span>01 / DISCOVER</span><strong>HIDDEN TWIN</strong><small>Find unexpected statistical similarities.</small></a>
                <a href="#stage35-evidence"><span>02 / INVESTIGATE</span><strong>THE EVIDENCE ROOM</strong><small>Test basketball claims against the data.</small></a>
                <a href="#stage35-war"><span>03 / DECIDE</span><strong>THE WAR ROOM</strong><small>Think and decide like a general manager.</small></a>
              </div>
            </header>

            <div className="exp35-experiment" id="stage35-twin">
              <div className="exp35-section-heading">
                <span className="exp35-section-number">12 / EXPERIMENT — DISCOVER</span>
                <div><h3>FIND THE <em>UNEXPECTED.</em></h3>
                <p>Choose a player and explore which other NBA profiles share a similar statistical fingerprint. Similarity is not a ranking of talent.</p></div>
              </div>
<HiddenTwin selectedPlayerName={selectedPlayerName} /> {/* NBA_DNA_STAGE35_2C_CONNECTED */}

          <div  />
            </div>

            <div className="exp35-experiment" id="stage35-evidence">
              <div className="exp35-section-heading">
                <span className="exp35-section-number">13 / EXPERIMENT — INVESTIGATE</span>
                <div><h3>QUESTION THE <em>NARRATIVE.</em></h3>
                <p>Read each claim, examine the available evidence, and decide whether the data supports it, contradicts it, or is insufficient.</p></div>
              </div>
          {selectedTeam && (
            <EvidenceRoom
              team={selectedName}
              teamColor={selectedInfo.color}
            />
          )}
            </div>

            <div className="exp35-experiment" id="stage35-war">
              <div className="exp35-section-heading">
                <span className="exp35-section-number">14 / EXPERIMENT — DECIDE</span>
                <div><h3>YOU MAKE <em>THE CALL.</em></h3>
                <p>Enter the front office. Evaluate rotation priorities, respond to absences, and compare player profiles using the available evidence.</p></div>
              </div>
          {selectedTeam && (
            <WarRoom
              team={selectedName}
              teamColor={selectedInfo.color}
            />
          )}
            </div>
          </div>

          <div className="method-note">
            <strong>RESEARCH NOTES / HOW TO READ THE DATA</strong>

            <div>
              <p>
                Roster change measures the share
                of projected rotation minutes
                allocated to incoming players or
                players without 2025–26 NBA games.
                It is not a forecast of wins,
                injuries, or games missed.
                The nine-player rotations are
                preseason projections.
              </p>

              <p>
                The Absence Ripple displays
                hypothetical scenario outputs.
                Redistributed minutes represent
                constrained model reallocations,
                not predictions of real
                replacements or team performance.
                A model residual does not imply
                that actual NBA game minutes
                would remain unused.
              </p>

              <p>
                The Player DNA displays observed
                historical statistical rates
                alongside projected 2026–27
                rotation roles. Historical
                production is not a forecast
                of future performance.
                Per-36 rates depend on sample size,
                and steals or blocks alone do
                not measure overall defensive
                quality. Missing historical
                statistics are not treated as zero.
              </p>

              <p>
                The Shot DNA displays verified
                ESPN shot events from a limited
                single-game sample. Official
                field-goal attempts are reconciled
                with the game box score.
                Blocked attempts count as misses.
                Spatial zones are exploratory
                approximations, not official
                NBA shot-zone classifications.
                Missing shot data is not zero.
              </p>

              <small>
                SOURCE: NBA DNA LAB /
                18AZ-C / 18AT / 19A /
                19G-D / 19H-F / 19H-K
              </small>
            </div>
          </div>
        </section>
      </main>

      {/* NBA_DNA_STAGE34_NEXT_CHAPTER */}
      <NextChapter />


      <footer className="site-footer">
        <div>
          <strong>NBA DNA LAB.</strong>
          <span>
            THE FRONT OFFICE /
            INDEPENDENT RESEARCH
          </span>
        </div>

        <div>
          <span>
            RESEARCH, ANALYSIS & DESIGN
          </span>
          <strong>
            EDUARDO IMAD AYALA GARCÍA
          </strong>
        </div>

        <div>
          <span>ARTICLE 001 / 2026–27</span>
          <span>© 2026 NBA DNA LAB</span>
        </div>
      </footer>

      <div className="site-disclaimer">
        NBA DNA LAB is an independent research
        project and is not affiliated with or
        endorsed by the NBA or its teams.
        Team logos and player imagery are used
        in this local design prototype pending
        publication rights review.
      </div>


    </div>
  );
}