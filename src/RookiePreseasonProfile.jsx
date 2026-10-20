
import React, { useEffect, useState } from "react";
import "./RookiePreseasonProfile.css";

export default function RookiePreseasonProfile({
  athleteKey
}) {
  const [profiles, setProfiles] = useState(null);

  useEffect(() => {
    let alive = true;

    fetch("/data/rookie_preseason_profiles_2026_27.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Rookie profile unavailable");
        }
        return response.json();
      })
      .then((json) => {
        if (alive) setProfiles(json);
      })
      .catch(() => {
        if (alive) setProfiles({});
      });

    return () => {
      alive = false;
    };
  }, []);

  const profile = profiles?.[String(athleteKey)];

  if (!profile) return null;

  const hasGames = profile.games_recorded > 0;

  return (
    <section className="sd-rookie-profile">
      <div className="sd-rookie-profile__eyebrow">
        ROOKIE DATA PROFILE
      </div>

      <div className="sd-rookie-profile__heading">
        <div>
          <h3>2026–27 PRESEASON</h3>
          <p>
            Exhibition games / separate from regular season
          </p>
        </div>

        <span className="sd-rookie-profile__status">
          {hasGames
            ? "BOXSCORE SAMPLE"
            : "NOT YET AUDITED"}
        </span>
      </div>

      {/* NBA_DNA_PRESEASON_PANEL_V2 */}
      {hasGames ? (
        <div className="sd-rookie-profile__stats">
          {[
            ["GP", profile.games_recorded],
            ["PPG", profile.preseason_ppg],
            ["RPG", profile.preseason_rpg],
            ["APG", profile.preseason_apg],
            ["FG", `${profile.fgm_recorded}/${profile.fga_recorded}`],
            ["FG%", profile.preseason_fg_pct],
            ["3P%", profile.preseason_3p_pct],
            ["FT%", profile.preseason_ft_pct],
            ["3PA", profile.preseason_3pa]
          ].map(([label, value]) => (
            <div key={label}>
              <small>{label}</small>
              <strong>{value ?? "—"}</strong>
            </div>
          ))}
        </div>
      ) : (
        <p className="sd-rookie-profile__empty">
          No preseason box scores audited for this
          player yet. This does not mean zero games
          or zero shots.
        </p>
      )}

      <p className="sd-rookie-profile__note">
        Shot locations not verified.
        No preseason shot coordinates are plotted.
        Recorded games are not necessarily the
        complete preseason schedule.
      </p>
    </section>
  );
}

