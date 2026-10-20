
import { useEffect, useMemo, useState } from "react";
import "./EvidenceRoom.css";


// NBA_DNA_STAGE32C1_FIX

const ER_TEAMS = {
  "Atlanta Hawks": ["#C8102E", "#FDB927", "atl"],
  "Boston Celtics": ["#007A33", "#BA9653", "bos"],
  "Brooklyn Nets": ["#222222", "#A0A0A0", "bkn"],
  "Charlotte Hornets": ["#1D1160", "#00788C", "cha"],
  "Chicago Bulls": ["#CE1141", "#111111", "chi"],
  "Cleveland Cavaliers": ["#860038", "#FDBB30", "cle"],
  "Dallas Mavericks": ["#00538C", "#B8C4CA", "dal"],
  "Denver Nuggets": ["#0E2240", "#FEC524", "den"],
  "Detroit Pistons": ["#C8102E", "#1D42BA", "det"],
  "Golden State Warriors": ["#1D428A", "#FFC72C", "gs"],
  "Houston Rockets": ["#CE1141", "#111111", "hou"],
  "Indiana Pacers": ["#002D62", "#FDBB30", "ind"],
  "LA Clippers": ["#C8102E", "#1D428A", "lac"],
  "Los Angeles Clippers": ["#C8102E", "#1D428A", "lac"],
  "Los Angeles Lakers": ["#552583", "#FDB927", "lal"],
  "Memphis Grizzlies": ["#5D76A9", "#12173F", "mem"],
  "Miami Heat": ["#98002E", "#F9A01B", "mia"],
  "Milwaukee Bucks": ["#00471B", "#EEE1C6", "mil"],
  "Minnesota Timberwolves": ["#0C2340", "#78BE20", "min"],
  "New Orleans Pelicans": ["#0C2340", "#C8102E", "no"],
  "New York Knicks": ["#006BB6", "#F58426", "ny"],
  "Oklahoma City Thunder": ["#007AC1", "#EF3B24", "okc"],
  "Orlando Magic": ["#0077C0", "#111111", "orl"],
  "Philadelphia 76ers": ["#006BB6", "#ED174C", "phi"],
  "Phoenix Suns": ["#1D1160", "#E56020", "phx"],
  "Portland Trail Blazers": ["#E03A3E", "#111111", "por"],
  "Sacramento Kings": ["#5A2D81", "#63727A", "sac"],
  "San Antonio Spurs": ["#68737A", "#111111", "sa"],
  "Toronto Raptors": ["#CE1141", "#111111", "tor"],
  "Utah Jazz": ["#27251F", "#F9A01B", "utah"],
  "Washington Wizards": ["#002B5C", "#E31837", "wsh"]
};

function erTheme(team, fallback) {
  const values = ER_TEAMS[team];

  return {
    primary: values?.[0] || fallback || "#405A6C",
    secondary: values?.[1] || "#C7A36A",
    logo: values?.[2]
      ? `https://a.espncdn.com/i/teamlogos/nba/500/${values[2]}.png`
      : null
  };
}

function erExplainMetric(metric) {
  const m = String(metric || "").toLowerCase();

  if (m.includes("true_shooting")) {
    return "True Shooting % measures how efficiently a player scores, including field goals, three-pointers and free throws. Higher means more efficient scoring, not necessarily a better player.";
  }

  if (m.includes("point")) {
    return "Points measure scoring. Check whether the number is a season total, per game or per minute.";
  }

  if (m.includes("assist")) {
    return "An assist is a pass that directly leads to a made basket. More assists do not automatically mean better overall playmaking.";
  }

  if (m.includes("rebound")) {
    return "Rebounds are recovered missed shots. Minutes played and player role matter.";
  }

  return "This statistic describes one part of a player's performance. One number cannot tell the whole story.";
}



// NBA_DNA_STAGE32C1B
function erReadableClaim(claim) {
  return String(claim || "")
    .replace(
      /^During the 2025[\u2013-]26 NBA regular season,\s*/i,
      ""
    )
    .replace(
      /\s+in the historical regular[\u2013-]season data\.?$/i,
      "."
    );
}


const CHOICES = [
  { id: "SUPPORTED", label: "SUPPORTED" },
  { id: "CONTRADICTED", label: "CONTRADICTED" },
  { id: "NOT_ENOUGH_EVIDENCE", label: "NOT ENOUGH EVIDENCE" }
];

const family = (id) =>
  String(id || "").replace(/-C$/, "");

function formatValue(value, metric) {
  if (value == null || value === "") return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return metric === "true_shooting_pct"
    ? `${(n * 100).toFixed(1)}%`
    : n.toFixed(1);
}

export default function EvidenceRoom({
  team,
  teamColor = "#54758A"
}) {
  const franchise = erTheme(team, teamColor);
  const [erHelp, setErHelp] = useState(false);
  const [erLogoError, setErLogoError] = useState(false);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [seen, setSeen] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    fetch(
      "/data/front_office_evidence_room_32a.json",
      { signal: controller.signal }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Evidence file unavailable.");
        return res.json();
      })
      .then((json) => {
        if (!Array.isArray(json.claims)) {
          throw new Error("Invalid evidence data.");
        }
        setClaims(json.claims);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  const teamClaims = useMemo(() => {
    const matching = claims.filter((c) => c.team === team);
    const groups = new Map();

    matching.forEach((c) => {
      const key = family(c.id);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(c);
    });

    const first = [];
    const second = [];
    let position = 0;

    groups.forEach((group) => {
      const primary =
        group.length === 2 && position % 2 === 1
          ? group[1]
          : group[0];

      first.push(primary);
      group.forEach((c) => {
        if (c !== primary) second.push(c);
      });
      position += 1;
    });

    return [...first, ...second];
  }, [claims, team]);

  useEffect(() => {
    setIndex(0);
    setAnswer(null);
    setSeen([]);
  }, [team]);

  const current = teamClaims[index] || null;
  const revealed = answer !== null;
  const correct = current && answer === current.verdict;

  const hasNumbers =
    current &&
    current.value_a != null &&
    current.value_b != null &&
    Number.isFinite(Number(current.value_a)) &&
    Number.isFinite(Number(current.value_b));

  function choose(value) {
    if (!current || revealed) return;
    setAnswer(value);
    setSeen((old) =>
      old.includes(current.id)
        ? old
        : [...old, current.id]
    );
  }

  function nextCase() {
    if (teamClaims.length < 2) {
      setAnswer(null);
      return;
    }

    let next = (index + 1) % teamClaims.length;

    for (let i = 0; i < teamClaims.length; i += 1) {
      if (
        family(teamClaims[next].id) !==
        family(current.id)
      ) break;

      next = (next + 1) % teamClaims.length;
    }

    setIndex(next);
    setAnswer(null);
  }

  return (
    <section
      className="er-section"
      style={{ "--er-accent": franchise.primary, "--er-secondary": franchise.secondary }}
      aria-labelledby="er-title"
    >
      <div className="er-shell">

        <div className="er-masthead">
          <span>THE FRONT OFFICE / INVESTIGATION UNIT</span>
          <span>CASE STUDY 32</span>
        </div>

        <header className="er-intro">
          <div>
            <p className="er-kicker">THE EVIDENCE ROOM</p>
            <h2 id="er-title">
              DON'T TRUST THE TAKE.
              <br />
              <em>TEST IT.</em>
            </h2>
          </div>

          <p className="er-deck">
            The basketball narrative is on trial.
            Read the claim, commit to a verdict,
            and open the file to see what the
            numbers actually establish.
          </p>
        </header>


        <div className="er-welcome">
          <div className="er-welcome-mark">
            {franchise.logo && !erLogoError ? (
              <img
                key={team}
                src={franchise.logo}
                alt={`${team} logo`}
                loading="lazy"
                onError={() => setErLogoError(true)}
              />
            ) : (
              <span>{String(team || "NBA").slice(0, 3).toUpperCase()}</span>
            )}
          </div>

          <div className="er-welcome-copy">
            <span className="er-welcome-kicker">
              YOUR FRANCHISE / {team}
            </span>
            <h3>YOU BE THE ANALYST.</h3>
            <p>
              Read the claim. Decide if the numbers support it,
              show the opposite, or aren't enough to decide.
              Then reveal the answer and learn why.
            </p>

            <button
              type="button"
              className="er-welcome-help"
              aria-expanded={erHelp}
              onClick={() => setErHelp(!erHelp)}
            >
              {erHelp ? "HIDE THE RULES −" : "HOW DO I PLAY? +"}
            </button>

            {erHelp && (
              <div className="er-rules">
                <p><strong>SUPPORTED</strong> The data backs up the claim.</p>
                <p><strong>CONTRADICTED</strong> The data shows the opposite.</p>
                <p><strong>NOT ENOUGH EVIDENCE</strong> There isn't reliable data to decide.</p>
                <p>No advanced basketball knowledge needed. You're judging evidence, not choosing the best player.</p>
              </div>
            )}
          </div>
        </div>

        <div className="er-workspace">

          <article className="er-case">

            <div className="er-case-head">
              <span>THE CLAIM / {current?.id || "—"}</span>
              <span className="er-status">
                {revealed
                  ? "EVIDENCE RELEASED"
                  : "EVIDENCE SEALED"}
              </span>
            </div>

            <div className="er-context">
              <span>{team || "NBA"}</span>
              <span>HISTORICAL REGULAR SEASON</span>
            </div>

            {loading ? (
              <p className="er-state">
                Retrieving case files…
              </p>
            ) : error ? (
              <p className="er-state" role="alert">
                {error}
              </p>
            ) : !current ? (
              <p className="er-state">
                No verified case for this franchise.
              </p>
            ) : (
              <>
                <p className="er-overline">
                  01 / THE ALLEGATION
                </p>

                <h3 className="er-claim">
                  {erReadableClaim(current.claim)}
                </h3>

                <div className="er-seal">
                  <div className="er-stamp">
                    {revealed ? "OPEN" : "SEALED"}
                  </div>

                  <div>
                    <strong>
                      {revealed
                        ? "The record is now public."
                        : "The numbers stay behind the seal."}
                    </strong>

                    <p>
                      {revealed
                        ? "Examine the evidence below."
                        : "Make your call before seeing the comparison."}
                    </p>
                  </div>
                </div>

                <div className="er-answer-head">
                  <span>02 / YOUR VERDICT</span>
                  <span>SELECT ONE</span>
                </div>


                <p className="er-quick-instruction">
                  <strong>YOUR MOVE:</strong> Do the numbers
                  support this statement, show the opposite,
                  or leave us without enough evidence?
                </p>

                <div className="er-choices">
                  {CHOICES.map((choice) => (
                    <button
                      key={choice.id}
                      type="button"
                      disabled={revealed}
                      className={[
                        "er-choice",
                        answer === choice.id
                          ? "er-selected"
                          : "",
                        revealed &&
                        current.verdict === choice.id
                          ? "er-correct"
                          : ""
                      ].join(" ")}
                      onClick={() => choose(choice.id)}
                    >
                      <span>{choice.label}</span>
                      <span aria-hidden="true">↗</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </article>

          <aside className="er-desk">
            <div className="er-desk-head">
              <span>INVESTIGATION DESK</span>
              <span className="er-indicator" />
            </div>

            <div className="er-desk-logo" aria-hidden="true">
              {franchise.logo && !erLogoError ? (
                <img
                  key={team}
                  src={franchise.logo}
                  alt=""
                  loading="lazy"
                  onError={() => setErLogoError(true)}
                />
              ) : (
                <span>{String(team || "NBA").slice(0, 3).toUpperCase()}</span>
              )}
            </div>

            <div className="er-desk-metric">
              <span>FRANCHISE</span>
              <strong>{team || "—"}</strong>
            </div>

            <div className="er-desk-metric">
              <span>AVAILABLE CASE FILES</span>
              <strong className="er-number">
                {String(teamClaims.length).padStart(2, "0")}
              </strong>
            </div>

            <div className="er-desk-metric">
              <span>UNIQUE FILES OPENED</span>
              <strong className="er-number">
                {String(seen.length).padStart(2, "0")}
              </strong>
            </div>

            <div className="er-desk-note">
              <span>RESEARCH PROTOCOL</span>
              <p>
                Historical production is not a prediction.
                Missing NBA regular-season evidence
                is not evidence of poor performance.
              </p>
            </div>
          </aside>
        </div>

        {current && revealed && (
          <div className="er-reveal" aria-live="polite">

            <div className="er-reveal-head">
              <div>
                <p className="er-kicker">
                  03 / THE EVIDENCE
                </p>

                <h3>
                  {correct
                    ? "GOOD READ."
                    : "THE RECORD DISAGREES."}
                </h3>
              </div>

              <span className="er-verdict">
                {CHOICES.find(
                  (c) => c.id === current.verdict
                )?.label}
              </span>
            </div>

            {hasNumbers ? (
              <div className="er-comparison">
                {[
                  {
                    name: current.player_a,
                    value: Number(current.value_a)
                  },
                  {
                    name: current.player_b,
                    value: Number(current.value_b)
                  }
                ].map((p) => {
                  const max = Math.max(
                    Number(current.value_a),
                    Number(current.value_b)
                  );

                  const width = max > 0
                    ? Math.max(0, p.value / max * 100)
                    : 0;

                  return (
                    <div className="er-player" key={p.name}>
                      <div className="er-player-head">
                        <strong>{p.name}</strong>
                        <span>
                          {formatValue(
                            p.value,
                            current.metric
                          )}
                        </span>
                      </div>

                      <div className="er-track">
                        <div
                          className="er-bar"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                <p className="er-caption">
                  {current.metric_label} · 2025–26
                  historical regular season ·
                  descriptive comparison
                </p>

                <div className="er-stat-guide">
                  <strong>WHAT DOES THIS STAT MEAN?</strong>
                  <p>{erExplainMetric(current.metric)}</p>
                  <small>
                    This comparison evaluates one specific claim,
                    not which player is better overall.
                  </small>
                </div>
              </div>
            ) : (
              <div className="er-missing">
                <strong>
                  NO USABLE VERIFIED NBA REGULAR-SEASON METRIC
                </strong>

                <p>
                  Unknown is not zero. Preseason
                  and projected numbers are not substituted.
                </p>
              </div>
            )}

            <div className="er-notes">
              <div>
                <h4>THE ANALYST'S NOTE</h4>
                <p>{current.explanation}</p>
              </div>

              <div>
                <h4>WHAT THIS DOESN'T PROVE</h4>
                <p>{current.limitations}</p>
              </div>
            </div>

            <button
              type="button"
              className="er-next"
              onClick={nextCase}
            >
              OPEN ANOTHER FILE
              <span aria-hidden="true">↗</span>
            </button>
          </div>
        )}

        <footer className="er-footer">
          <span>
            2025–26 HISTORICAL EVIDENCE /
            2026–27 PROJECTED ROSTERS
          </span>
          <span>
            PRESEASON IS NOT REGULAR SEASON
          </span>
        </footer>

      </div>
    </section>
  );
}

