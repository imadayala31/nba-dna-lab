
import { useEffect, useMemo, useState } from "react";
import "./BlindPlayerTest.css";
import "./BlindPlayerTestLight.css";

const DATA_URL = "/data/front_office_player_dna_19hf.json";

const PHOTO_BY_ID = {
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

const CHALLENGES = [
  {
    key: "assists_per_36",
    title: "Who creates more for teammates?",
    unit: "AST / 36",
    explain:
      "Assists per 36 minutes highlight playmaking output at a common minutes baseline. They do not measure every pass or every created chance."
  },
  {
    key: "points_per_36",
    title: "Who scores more per minute?",
    unit: "PTS / 36",
    explain:
      "Points per 36 minutes put scoring production on a common playing-time scale. Role and shot selection still matter."
  },
  {
    key: "rebounds_per_36",
    title: "Who wins more rebounds?",
    unit: "REB / 36",
    explain:
      "Rebounds per 36 minutes compare rebounding production while accounting for playing time. They do not capture every box-out."
  }
];

const valid = (v) =>
  typeof v === "number" && Number.isFinite(v);

const initials = (s) =>
  String(s || "NBA")
    .split(/\s+/)
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toUpperCase();

function Card({
  player,
  label,
  flipped,
  selected,
  onSelect,
  metric
}) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [player?.athlete_key, player?.player]);

  const portrait =
    PHOTO_BY_ID[String(player?.athlete_key ?? "")] ||
    player?.headshot_url ||
    null;

  const stat = Number(
    player?.historical_metrics?.[metric] ??
    player?.[metric]
  );

  return (
    <button
      type="button"
      className={`blind-card ${
        flipped ? "is-flipped" : ""
      } ${selected ? "is-selected" : ""}`}
      onClick={onSelect}
      disabled={flipped}
      aria-pressed={!flipped ? selected : undefined}
      aria-label={
        flipped
          ? `${label}: ${player?.player}`
          : `Choose player ${label}`
      }
    >
      <span className="blind-card-inner">

        <span className="blind-card-face blind-card-front">
          <span className="blind-card-top">
            PLAYER {label}
            <span>
              {selected ? "YOUR PICK" : "MYSTERY PROFILE"}
            </span>
          </span>

          <span className="blind-clues-content">
            <span className="blind-clues-symbol" aria-hidden="true"><span className="blind-dna-mark">DNA</span><span className="blind-dna-mark-sub">LAB / {label === "A" ? "001" : "002"}</span></span>
            <span className="blind-clues-label">SCOUTING CLUES</span>
            <span className="blind-clue-grid">
              {[
                ["points_per_36", "PTS / 36"],
                ["assists_per_36", "AST / 36"],
                ["rebounds_per_36", "REB / 36"]
              ]
                .filter(([key]) => key !== metric)
                .map(([key, unit]) => {
                  const raw =
                    player?.historical_metrics?.[key] ??
                    player?.[key];
                  const n = Number(raw);
                  return (
                    <span className="blind-clue" key={key}>
                      <strong>
                        {raw != null && Number.isFinite(n)
                          ? n.toFixed(1)
                          : "—"}
                      </strong>
                      <small>{unit}</small>
                    </span>
                  );
                })}
            </span>
            <span className="blind-clues-lock">
              CHALLENGE STAT REVEALED AFTER THE FLIP
            </span>
          </span>
          <span className="blind-card-foot">
            IDENTITY LOCKED
          </span>
        </span>

        <span className="blind-card-face blind-card-back">
          <span className="blind-card-top">
            PLAYER {label}
            <span>REVEALED</span>
          </span>

          <span className="blind-photo">
            {portrait && !imageFailed ? (
              <img
                src={portrait}
                alt=""
                loading="lazy"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <span className="blind-photo-fallback">
                {initials(player?.player)}
              </span>
            )}
          </span>

          <strong className="blind-player-name">
            {player?.player}
          </strong>

          <span className="blind-player-meta">
            {player?.team} ·{" "}
            {player?.primary_position ||
              "Position unavailable"}
          </span>

          <span className="blind-card-stat">
            {stat.toFixed(1)}{" "}
            <small>
              {CHALLENGES.find(
                (c) => c.key === metric
              )?.unit}
            </small>
          </span>
        </span>

      </span>
    </button>
  );
}

export default function BlindPlayerTest({
  onPlayerSelect
}) {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [challengeIndex, setChallengeIndex] =
    useState(0);
  const [round, setRound] = useState(0);
  const [pick, setPick] = useState("");
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    let active = true;

    fetch(DATA_URL)
      .then((r) => {
        if (!r.ok) {
          throw new Error(
            "Player DNA data unavailable"
          );
        }
        return r.json();
      })
      .then((rows) => {
        if (active) {
          if (!Array.isArray(rows)) {
            throw new Error(
              "Invalid Player DNA data"
            );
          }
          setData(rows);
        }
      })
      .catch((e) => {
        if (active) {
          setError(
            e.message || "Unable to load challenge"
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const challenge = CHALLENGES[challengeIndex];

  const eligible = useMemo(
    () =>
      data.filter(
        (p) =>
          p?.historical_metrics_usable === true &&
          valid(
            p?.historical_metrics?.[challenge.key] ??
            p?.[challenge.key]
          ) &&
          p?.player &&
          p?.team
      ),
    [data, challenge.key]
  );

  const pair = useMemo(() => {
    if (eligible.length < 2) return null;

    const ordered = [...eligible].sort(
      (a, b) =>
        String(a.team + "|" + a.player)
          .localeCompare(
            String(b.team + "|" + b.player)
          )
    );

    const i =
      (round * 17 + challengeIndex * 31) %
      ordered.length;

    const a = ordered[i];

    const aVal =
      a.historical_metrics?.[challenge.key] ??
      a[challenge.key];

    const candidates = ordered.filter(
      (p) =>
        p.player !== a.player &&
        p.team !== a.team &&
        Math.abs(
          (
            p.historical_metrics?.[challenge.key] ??
            p[challenge.key]
          ) - aVal
        ) >= 0.5
    );

    if (!candidates.length) return null;

    const b = candidates[
      (round * 11 + challengeIndex * 7) %
      candidates.length
    ];

    return [a, b];
  }, [
    eligible,
    round,
    challengeIndex,
    challenge.key
  ]);

  const value = (p) =>
    p?.historical_metrics?.[challenge.key] ??
    p?.[challenge.key];

  const winner = pair
    ? value(pair[0]) > value(pair[1])
      ? "A"
      : value(pair[1]) > value(pair[0])
        ? "B"
        : "TIE"
    : "";

  const reset = (
    nextIndex = challengeIndex,
    nextRound = round + 1
  ) => {
    setChallengeIndex(nextIndex);
    setRound(nextRound);
    setPick("");
    setFlipped(false);
  };

  return (
    <section
      className="blind-section"
      id="blind-player-test"
      aria-labelledby="blind-heading"
    >
      <div className="blind-shell">

        <div className="blind-topline">
          <span>03 / THE BLIND PLAYER TEST</span>
          <span>NBA DNA LAB · PLAYER IDENTITY</span>
        </div>

        <div className="blind-intro">
          <p className="blind-kicker">
            THE BOX SCORE IS JUST THE BEGINNING
          </p>

          <h2 id="blind-heading">
            SAME LEAGUE.
            <br />
            <em>DIFFERENT DNA.</em>
          </h2>

          <p>
            Forget the names for a second.
            Look at the question. Make your pick.
            Then flip the cards and see what
            the numbers say.
          </p>
        </div>

        <div className="blind-game">

          <div className="blind-game-top">
            <div>
              <span className="blind-small">
                YOUR CHALLENGE
              </span>
              <h3>{challenge.title}</h3>
            </div>

            <label className="blind-select-label">
              SKILL
              <select
                value={challengeIndex}
                onChange={(e) =>
                  reset(Number(e.target.value), round)
                }
              >
                {CHALLENGES.map((c, i) => (
                  <option key={c.key} value={i}>
                    {c.unit}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error ? (
            <p role="alert">{error}</p>
          ) : !pair ? (
            <p>
              {data.length
                ? "Not enough verified historical profiles for this challenge."
                : "Loading player profiles…"}
            </p>
          ) : (
            <>
              <div className="blind-card-grid">
                {pair.map((p, i) => (
                  <Card
                    key={
                      p.team +
                      p.player +
                      round +
                      challengeIndex
                    }
                    player={p}
                    label={i === 0 ? "A" : "B"}
                    flipped={flipped}
                    selected={
                      pick === (i === 0 ? "A" : "B")
                    }
                    onSelect={() =>
                      setPick(i === 0 ? "A" : "B")
                    }
                    metric={challenge.key}
                  />
                ))}
              </div>

              <div className="blind-actions">
                <button
                  className="blind-primary"
                  type="button"
                  disabled={!pick || flipped}
                  onClick={() => setFlipped(true)}
                >
                  {flipped
                    ? "IDENTITIES REVEALED"
                    : "REVEAL THE PLAYERS ↗"}
                </button>

                <button
                  className="blind-secondary"
                  type="button"
                  onClick={() => reset()}
                >
                  NEW MATCHUP ↻
                </button>
              </div>

              {flipped && (
                <div
                  className="blind-result"
                  aria-live="polite"
                >
                  <span className="blind-small">
                    THE REVEAL
                  </span>

                  <h3>
                    {winner === "TIE"
                      ? "It's a tie."
                      : `Player ${winner} leads in ${challenge.unit}.`}
                  </h3>

                  <p>
                    {pick === winner
                      ? "Good read. "
                      : winner === "TIE"
                        ? "Neither player has the edge here. "
                        : "The numbers tell a different story. "}
                    {challenge.explain}
                  </p>

                  <div className="blind-explore">
                    {pair.map((p) => (
                      <button
                        key={p.team + p.player}
                        type="button"
                        onClick={() => {
                          onPlayerSelect?.(p);
                          document
                            .getElementById(
                              "blind-player-dna-target"
                            )
                            ?.scrollIntoView({
                              behavior: "smooth",
                              block: "start"
                            });
                        }}
                      >
                        EXPLORE {p.player.toUpperCase()}
                        {" "}IN PLAYER DNA ↗
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <p className="blind-method">
            Historical Player DNA sample · Only
            profiles with usable historical metrics
            enter the test. Per-36 stats describe
            past production, not a 2026–27 forecast.
          </p>
        </div>
      </div>
    </section>
  );
}
