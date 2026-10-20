import React, { useEffect, useState } from "react";
import "./HistoricalVeteranDNA.css";

const VETERAN_IDS = new Set([
  "6606", "2991230", "6442", "3136196", "4396993"
]);

export default function HistoricalVeteranDNA({ athleteId }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(false);

  const id = String(athleteId ?? "");
  const isVeteran = VETERAN_IDS.has(id);

  useEffect(() => {
    if (!isVeteran) {
      setProfile(null);
      setError(false);
      return;
    }

    let active = true;
    setProfile(null);
    setError(false);

    fetch(`/data/shot_dna_2024_25_map/player_${id}.json`)
      .then((r) => {
        if (!r.ok) throw new Error("Historical profile unavailable");
        return r.json();
      })
      .then((data) => {
        if (active) setProfile(data);
      })
      .catch(() => {
        if (active) setError(true);
      });

    return () => { active = false; };
  }, [id, isVeteran]);

  if (!isVeteran) return null;

  if (error) {
    return <div className="historical-veteran-panel">
      HISTORICAL DATA UNAVAILABLE
    </div>;
  }

  if (!profile) {
    return <div className="historical-veteran-panel">
      LOADING HISTORICAL SHOT DNA...
    </div>;
  }

  const shots = profile.shots || [];
  const made = shots.filter((s) => s.made).length;
  const pct = shots.length ? (100 * made / shots.length).toFixed(1) : "0.0";

  return (
    <section className="historical-veteran-panel">
      <header className="historical-veteran-header">
        {profile.headshot_url && (
          <img
            src={profile.headshot_url}
            alt={`${profile.player} portrait`}
            className="historical-veteran-photo"
          />
        )}
        <div>
          <div className="historical-veteran-kicker">
            HISTORICAL FALLBACK · 2024–25 REGULAR SEASON
          </div>
          <h3>{profile.player}</h3>
          <div className="historical-veteran-note">
            PARTIAL COVERAGE · ESPN COORDINATES PROVISIONAL
          </div>
        </div>
      </header>

      <div className="historical-veteran-stats">
        <span>SHOTS <strong>{shots.length}</strong></span>
        <span>MADE <strong>{made}</strong></span>
        <span>FG% <strong>{pct}%</strong></span>
        <span>OUTSIDE HALF COURT <strong>
          {profile.geometry?.out_of_half_court_excluded ?? 0}
        </strong></span>
      </div>

      <div className="historical-veteran-court">
        <svg
          viewBox="0 0 500 470"
          role="img"
          aria-label={`${profile.player} historical shot chart`}
        >
          <rect x="1" y="1" width="498" height="468"
            fill="#c99052" stroke="#fff" strokeWidth="2" />
          <path d="M 0 190 H 170 V 0 M 330 0 V 190 H 500"
            fill="none" stroke="#fff" strokeWidth="2" />
          <circle cx="250" cy="52.5" r="7.5"
            fill="none" stroke="#fff" strokeWidth="2" />
          <path d="M 220 40 H 280"
            fill="none" stroke="#fff" strokeWidth="2" />
          <path d="M 250 290 A 237.5 237.5 0 0 0 250 290"
            fill="none" stroke="#fff" strokeWidth="2" />

          {shots.map((s, index) => (
            <circle
              key={`${s.event_id ?? index}-${index}`}
              cx={Number(s.x) * 10}
              cy={Number(s.y) * 10}
              r="3.2"
              fill={s.made ? "#42f5a7" : "#ff5b70"}
              opacity="0.72"
            >
              <title>{s.description || "Shot"}</title>
            </circle>
          ))}
        </svg>
      </div>

      <p className="historical-veteran-footer">
        Historical season shown separately from 2025–26.
        " "
        Shot coordinates are provisional and should not be
        " "
        interpreted as fully geometry-certified.
      </p>
    </section>
  );
}
