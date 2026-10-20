
import { useEffect, useMemo, useState } from "react";
import {
  buildTwinModel,
  findHiddenTwins,
} from "./hiddenTwinEngine";
import "./HiddenTwin.css";

const formatDistance = (value) =>
  Number.isFinite(value) ? value.toFixed(3) : "—";

const formatMetric = (value) =>
  Number.isFinite(Number(value))
    ? Number(value).toFixed(2)
    : "—";


/* NBA_DNA_STAGE30B2 */
function TwinPortrait({ player, featured = false }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [player?.athlete_key, player?.headshot_url]);

  const local = player.athlete_key
    ? `/images/players/espn_${player.athlete_key}.png`
    : null;

  const remote = player.headshot_url || null;

  const [sourceIndex, setSourceIndex] = useState(0);
  useEffect(() => setSourceIndex(0), [player?.athlete_key, player?.headshot_url]);

  const sources = [local, remote].filter(Boolean);
  const url = sources[sourceIndex];

  return (
    <div className={
      featured
        ? "hidden-twin-portrait hidden-twin-portrait-featured"
        : "hidden-twin-portrait"
    }>
      {url && !failed ? (
        <img
          src={url}
          alt={player.player}
          loading="lazy"
          onError={() => {
            if (sourceIndex + 1 < sources.length) {
              setSourceIndex(sourceIndex + 1);
            } else {
              setFailed(true);
            }
          }}
        />
      ) : (
        <span className="hidden-twin-portrait-fallback">
          {player.player
            .split(" ")
            .map(part => part[0])
            .slice(0, 2)
            .join("")}
        </span>
      )}
    </div>
  );
}


export default function HiddenTwin({ selectedPlayerName = null }) {
  const [players, setPlayers] = useState([]);
  const [selectedKey, setSelectedKey] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("loading");

  // NBA_DNA_STAGE35_2C_CONNECTED
  useEffect(() => {
    if (!selectedPlayerName || !players.length) return;

    const normalizeName = (value) =>
      String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

    const wanted = normalizeName(selectedPlayerName);
    const match = players.find(
      (player) => normalizeName(player.player) === wanted
    );

    if (!match) return;

    setSelectedKey(playerKey(match));
    setSearch('');
  }, [selectedPlayerName, players]);


  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(
          "/data/front_office_player_dna_19hf.json",
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Unable to load player profiles.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid player data.");
        }

        if (!controller.signal.aborted) {
          setPlayers(data);
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

  const model = useMemo(
    () => buildTwinModel(players),
    [players]
  );

  const eligible = useMemo(
    () =>
      [...model.eligible].sort((a, b) =>
        a.player.localeCompare(b.player)
      ),
    [model]
  );

  const playerKey = (player) =>
    `${player.player}|||${player.team}`;

  const selected = useMemo(
    () =>
      eligible.find(
        (player) => playerKey(player) === selectedKey
      ) || null,
    [eligible, selectedKey]
  );

  const results = useMemo(
    () =>
      selected
        ? findHiddenTwins(model, selected, 3)
        : [],
    [model, selected]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return eligible.slice(0, 6);

    return eligible
      .filter((player) =>
        `${player.player} ${player.team}`
          .toLowerCase()
          .includes(term)
      )
      .slice(0, 6);
  }, [eligible, search]);

  function choose(player) {
    setSelectedKey(playerKey(player));
    setSearch(player.player);
  }

  return (
    <section
      id="hidden-twin"
      className="hidden-twin"
      aria-labelledby="hidden-twin-title"
    >
      <div className="hidden-twin-inner">
        <div className="hidden-twin-eyebrow">
          <span>THE FRONT OFFICE / EXPERIMENT 01</span>
          <span>PLAYER SIMILARITY LAB</span>
        </div>

        <header className="hidden-twin-header">
          <p className="hidden-twin-kicker">
            FIND THE UNEXPECTED.
          </p>
          <h2 id="hidden-twin-title">
            HIDDEN <em>TWIN.</em>
          </h2>
          <p className="hidden-twin-intro">
            Forget the reputation. Follow the numbers.
            Discover which players share a statistical
            fingerprint — even when their names,
            teams, or roles seem worlds apart.
          </p>
        </header>

        {status === "loading" && (
          <p role="status">Loading player profiles…</p>
        )}

        {status === "error" && (
          <p role="alert">
            Player profiles could not be loaded.
          </p>
        )}

        {status === "ready" && (
          <>
            <div className="hidden-twin-search-panel">
              <label htmlFor="hidden-twin-search">
                01 / CHOOSE YOUR PLAYER
              </label>

              <input
                id="hidden-twin-search"
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setSelectedKey("");
                }}
                placeholder="Search NBA players…"
                autoComplete="off"
              />

              <div className="hidden-twin-options">
                {filtered.map((player) => (
                  <button
                    key={playerKey(player)}
                    type="button"
                    onClick={() => choose(player)}
                    className={
                      selectedKey === playerKey(player)
                        ? "is-selected"
                        : ""
                    }
                  >
                    <span>{player.player}</span>
                    <small>{player.team}</small>
                  </button>
                ))}
              </div>
            </div>

            {selected ? (
              <div className="hidden-twin-results">
                <div className="hidden-twin-selected">
                  <TwinPortrait player={selected} featured />
                  <span>YOUR REFERENCE PLAYER</span>
                  <h3>{selected.player}</h3>
                  <p>
                    {selected.team} /{" "}
                    {selected.primary_position}
                  </p>
                </div>

                <div className="hidden-twin-result-heading">
                  <span>02 / THE CLOSEST MATCHES</span>
                  <span>LOWER DISTANCE = CLOSER PROFILE</span>
                </div>

                <div className="hidden-twin-grid">
                  {results.map((result, index) => (
                    <article
                      className="hidden-twin-card"
                      key={playerKey(result.player)}
                    >
                      <div className="hidden-twin-card-top">
                        <span>
                          MATCH 0{index + 1}
                        </span>
                        <span>
                          {result.metricCount}/9 METRICS
                        </span>
                      </div>

                      <TwinPortrait player={result.player} />
                      <h3>{result.player.player}</h3>

                      <p className="hidden-twin-team">
                        {result.player.team} /{" "}
                        {result.player.primary_position}
                      </p>

                      <div className="hidden-twin-distance">
                        <strong>
                          {formatDistance(result.distance)}
                        </strong>
                        <span>STATISTICAL DISTANCE</span>
                      </div>

                      <div className="hidden-twin-explanation">
                        <h4>CLOSEST METRICS</h4>

                        {result.similarities.map((metric) => (
                          <div key={metric.key}>
                            <span>{metric.label}</span>
                            <small>
                              {formatMetric(metric.playerValue)}
                              {" / "}
                              {formatMetric(metric.candidateValue)}
                            </small>
                          </div>
                        ))}

                        <h4>BIGGEST DIFFERENCES</h4>

                        {result.differences.map((metric) => (
                          <div key={metric.key}>
                            <span>{metric.label}</span>
                            <small>
                              {formatMetric(metric.playerValue)}
                              {" / "}
                              {formatMetric(metric.candidateValue)}
                            </small>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <div className="hidden-twin-empty">
                <span>AWAITING PLAYER SELECTION</span>
                <p>
                  Every player has a statistical twin.
                  Find out who yours leads to.
                </p>
              </div>
            )}

            <p className="hidden-twin-method">
              METHOD / Nine historical statistical
              metrics, standardized by league-sample
              variation. Minimum six comparable
              metrics and 500 historical minutes.
              Same-team candidates are excluded.
              Similarity is not a measure of talent,
              player value, or projected performance.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
