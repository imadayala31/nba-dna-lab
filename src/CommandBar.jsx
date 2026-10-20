
import { useEffect, useState } from "react";
import "./CommandBar.css";

// NBA_DNA_STAGE35_3A_NAV_FIX
// NBA_DNA_STAGE35_1

const NAV_ITEMS = [
  { id: "top", label: "INTRO" },
  { id: "stage29-challenge", label: "CHALLENGE" },
  { id: "stage35-blind", label: "BLIND TEST" },
  { id: "roster-shockwave", label: "LEAGUE" },
  { id: "stage35-rotation", label: "ROTATION" },
  { id: "stage35-absence", label: "ABSENCE" },
  { id: "stage35-shots", label: "SHOT DNA" },
  { id: "stage35-player", label: "PLAYER DNA" },
  { id: "stage35-twin", label: "HIDDEN TWIN" },
  { id: "stage35-evidence", label: "EVIDENCE" },
  { id: "stage35-war", label: "WAR ROOM" },
  { id: "the-next-chapter", label: "NEXT CHAPTER" }
];

export default function CommandBar({
  teams = [],
  selectedName = "",
  onTeamSelect
}) {
  const [activeSection, setActiveSection] =
    useState("top");

  const [isCompact, setIsCompact] =
    useState(false);

  useEffect(() => {
    let frame = null;

    function update() {
      frame = null;

      setIsCompact(window.scrollY > 120);

      const threshold = 165;
      let current = "top";
      let closestTop = -Infinity;

      for (const item of NAV_ITEMS) {
        const element =
          document.getElementById(item.id);

        if (!element) continue;

        const top =
          element.getBoundingClientRect().top;

        if (
          top <= threshold &&
          top > closestTop
        ) {
          closestTop = top;
          current = item.id;
        }
      }

      setActiveSection(current);
    }

    function requestUpdate() {
      if (frame !== null) return;

      frame = window.requestAnimationFrame(update);
    }

    update();

    window.addEventListener(
      "scroll",
      requestUpdate,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      requestUpdate
    );

    return () => {
      window.removeEventListener(
        "scroll",
        requestUpdate
      );

      window.removeEventListener(
        "resize",
        requestUpdate
      );

      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  function goTo(id) {
    const target = document.getElementById(id);

    if (!target) return;

    target.scrollIntoView({
      behavior: window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches ? "auto" : "smooth",
      block: "start"
    });

    setActiveSection(id);
  }

  return (
    <div
      className={
        "cb-root" +
        (isCompact ? " cb-compact" : "")
      }
      aria-label="The Front Office navigation"
    >
      <div className="cb-inner">

        <div className="cb-brand">
          <span className="cb-brand-mark">
            FO<span>.</span>
          </span>

          <div className="cb-brand-copy">
            <strong>THE FRONT OFFICE</strong>
            <small>NBA DNA LAB / COMMAND BAR</small>
          </div>
        </div>

        <nav
          className="cb-links"
          aria-label="Explore the project"
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={
                "cb-link" +
                (activeSection === item.id
                  ? " cb-active"
                  : "")
              }
              onClick={() => goTo(item.id)}
              aria-current={
                activeSection === item.id
                  ? "location"
                  : undefined
              }
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="cb-controls">

          <div className="cb-team">
            <label htmlFor="cb-team-select">
              ACTIVE FRANCHISE
            </label>

            <select
              id="cb-team-select"
              value={selectedName}
              disabled={!teams.length}
              onChange={(event) => {
                if (
                  typeof onTeamSelect ===
                  "function"
                ) {
                  onTeamSelect(
                    event.target.value
                  );
                }
              }}
            >
              {!teams.length && (
                <option value="">
                  LOADING TEAMS
                </option>
              )}

              {teams.map((team) => (
                <option
                  key={team.team}
                  value={team.team}
                >
                  {team.team}
                </option>
              ))}
            </select>
          </div>

          <button
            className="cb-top"
            type="button"
            onClick={() => goTo("top")}
            aria-label="Back to top"
            title="Back to top"
          >
            ↑
          </button>

        </div>
      </div>
    </div>
  );
}

