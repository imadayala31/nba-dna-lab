
import { useEffect, useMemo, useState } from "react";
import "./DominoEffect.css";

const fmt = (n) =>
  Number.isFinite(Number(n))
    ? Number(n).toFixed(1)
    : "—";

const positive = (n) =>
  Math.max(0, Number(n) || 0);

function Portrait({ player }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [player?.headshot_url]);

  return (
    <div className="domino-portrait">
      {player?.headshot_url && !failed ? (
        <img
          src={player.headshot_url}
          alt={player.player}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>
          {String(player?.player || "?")
            .split(" ")
            .slice(0, 2)
            .map((part) => part[0])
            .join("")}
        </span>
      )}
    </div>
  );
}

export default function DominoEffect({
  team,
  selectedPlayerName,
  teamColor = "#2864f0",
}) {
  const [data, setData] = useState({
    atlas: [],
    links: [],
    summary: [],
  });

  const [status, setStatus] = useState("loading");
  const [mode, setMode] = useState("UNAVAILABLE");

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const paths = [
          "/data/front_office_league_atlas_19fb.json",
          "/data/front_office_universal_links_19gd.json",
          "/data/front_office_universal_summary_19gd.json",
        ];

        const responses = await Promise.all(
          paths.map((path) =>
            fetch(path, { signal: controller.signal })
          )
        );

        if (responses.some((response) => !response.ok)) {
          throw new Error("Scenario data unavailable.");
        }

        const [atlas, links, summary] =
          await Promise.all(
            responses.map((response) => response.json())
          );

        if (![atlas, links, summary].every(Array.isArray)) {
          throw new Error("Invalid scenario dataset.");
        }

        if (!controller.signal.aborted) {
          setData({ atlas, links, summary });
          setStatus("ready");
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setStatus("error");
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
            positive(b.projected_mpg) -
            positive(a.projected_mpg)
        ),
    [data.atlas, team]
  );

  const player =
    rotation.find(
      (item) => item.player === selectedPlayerName
    )?.player ||
    rotation[0]?.player ||
    "";

  useEffect(() => {
    setMode("UNAVAILABLE");
  }, [team, player]);

  const summaryFor = (scenario) =>
    data.summary.find(
      (item) =>
        item.team === team &&
        item.target_player === player &&
        item.scenario === scenario
    );

  const activeSummary = summaryFor(mode);
  const halfSummary = summaryFor("HALF_ROLE");
  const outSummary = summaryFor("UNAVAILABLE");

  const recipients = useMemo(() => {
    const matching = data.links.filter(
      (item) =>
        item.team === team &&
        item.target_player === player &&
        item.scenario === mode
    );

    const totals = new Map();

    for (const item of matching) {
      const name = item.target;

      totals.set(
        name,
        (totals.get(name) || 0) +
          positive(item.added_mpg)
      );
    }

    return [...totals.entries()]
      .map(([name, added]) => {
        const profile = rotation.find(
          (item) => item.player === name
        );

        const baseline = positive(profile?.projected_mpg);

        return {
          name,
          added,
          baseline,
          after: baseline + added,
          profile,
        };
      })
      .sort((a, b) => b.added - a.added);
  }, [data.links, team, player, mode, rotation]);

  const maxAdded = Math.max(
    1,
    ...recipients.map((item) => item.added)
  );

  const leader = recipients[0];

  return (
    <section
      id="domino-effect"
      className="domino-effect"
      style={{ "--domino-team": teamColor }}
    >
      <div className="domino-inner">
        <div className="domino-overline">
          <span>ROTATION INTELLIGENCE / EXPERIMENT 02</span>
          <span>THE CONSEQUENCE LAB</span>
        </div>

        <header className="domino-header">
          <span className="domino-kicker">
            ONE CHANGE. MULTIPLE CONSEQUENCES.
          </span>

          <h2>
            THE DOMINO <em>EFFECT.</em>
          </h2>

          <p>
            Absence Ripple shows where the minutes go.
            Domino Effect shows who gains the most —
            and how their projected role changes.
          </p>
        </header>

        {status === "loading" && (
          <p role="status">Loading scenarios…</p>
        )}

        {status === "error" && (
          <p role="alert">
            Could not load Domino Effect data.
          </p>
        )}

        {status === "ready" && (
          <>
            <div className="domino-context">
              <div>
                <span>ACTIVE ROTATION</span>
                <h3>{team}</h3>
                <p>Reference player: {player || "—"}</p>
              </div>

              <div className="domino-switch">
                <button
                  type="button"
                  className={
                    mode === "HALF_ROLE" ? "active" : ""
                  }
                  onClick={() => setMode("HALF_ROLE")}
                  aria-pressed={mode === "HALF_ROLE"}
                >
                  HALF ROLE
                </button>

                <button
                  type="button"
                  className={
                    mode === "UNAVAILABLE" ? "active" : ""
                  }
                  onClick={() => setMode("UNAVAILABLE")}
                  aria-pressed={mode === "UNAVAILABLE"}
                >
                  UNAVAILABLE
                </button>
              </div>
            </div>

            {!activeSummary ? (
              <p className="domino-empty">
                No scenario is available for this selection.
              </p>
            ) : (
              <>
                <div className="domino-stats">
                  <div>
                    <span>MINUTES REMOVED</span>
                    <strong>
                      {fmt(activeSummary.minutes_removed)}
                    </strong>
                    <small>MPG</small>
                  </div>

                  <div>
                    <span>MINUTES REDISTRIBUTED</span>
                    <strong>
                      {fmt(activeSummary.minutes_redistributed)}
                    </strong>
                    <small>MPG</small>
                  </div>

                  <div>
                    <span>BIGGEST RECIPIENT</span>
                    <strong className="domino-name">
                      {leader?.name || "—"}
                    </strong>
                    <small>
                      {leader
                        ? `+${fmt(leader.added)} MPG`
                        : "NO RECIPIENT"}
                    </small>
                  </div>
                </div>

                <div className="domino-main">
                  <div className="domino-ranking">
                    <div className="domino-subheading">
                      <h3>WHO FEELS THE IMPACT?</h3>
                      <span>MODELED ADDITIONAL MPG</span>
                    </div>

                    {recipients.length === 0 ? (
                      <p className="domino-empty">
                        No minutes are redistributed
                        in this scenario.
                      </p>
                    ) : (
                      recipients.map((item, index) => (
                        <article
                          className="domino-recipient"
                          key={item.name}
                        >
                          <span className="domino-rank">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <Portrait player={item.profile} />

                          <div className="domino-recipient-body">
                            <div className="domino-recipient-title">
                              <strong>{item.name}</strong>
                              <span>
                                +{fmt(item.added)} MPG
                              </span>
                            </div>

                            <div className="domino-bar">
                              <div
                                style={{
                                  width: `${
                                    (item.added / maxAdded) * 100
                                  }%`,
                                }}
                              />
                            </div>

                            <small>
                              BASE {fmt(item.baseline)} →
                              SCENARIO {fmt(item.after)} MPG
                            </small>
                          </div>
                        </article>
                      ))
                    )}
                  </div>

                  <aside className="domino-insight">
                    <span>THE SCENARIO SHIFT</span>

                    <h3>
                      HALF ROLE
                      <br />
                      VS. UNAVAILABLE
                    </h3>

                    <div>
                      <span>HALF ROLE / REDISTRIBUTED</span>
                      <strong>
                        {fmt(halfSummary?.minutes_redistributed)}
                        <small> MPG</small>
                      </strong>
                    </div>

                    <div>
                      <span>UNAVAILABLE / REDISTRIBUTED</span>
                      <strong>
                        {fmt(outSummary?.minutes_redistributed)}
                        <small> MPG</small>
                      </strong>
                    </div>

                    <div>
                      <span>ADDITIONAL REDISTRIBUTION</span>
                      <strong>
                        {halfSummary && outSummary
                          ? fmt(
                              positive(
                                outSummary.minutes_redistributed
                              ) -
                              positive(
                                halfSummary.minutes_redistributed
                              )
                            )
                          : "—"}
                        <small> MPG</small>
                      </strong>
                    </div>

                    <p>
                      These are hypothetical minute-allocation
                      scenarios, not forecasts of performance,
                      wins, chemistry, or injury outcomes.
                    </p>
                  </aside>
                </div>
              </>
            )}
          </>
        )}

        <div className="domino-footer">
          <span>THE FRONT OFFICE / NBA DNA LAB</span>
          <p>
            From a single missing piece to a different
            distribution of responsibility.
          </p>
        </div>
      </div>
    </section>
  );
}

