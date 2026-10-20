
import "./NextChapter.css";

// NBA_DNA_STAGE34_NEXT_CHAPTER

const chapters = [
  {
    number: "01",
    label: "THE VISION",
    title: "Why we built this.",
    paragraphs: [
      "Basketball is more than a box score. Points, rebounds and assists matter, but they rarely tell the complete story of a player, a roster or a decision.",
      "THE FRONT OFFICE was created to explore the questions behind the numbers. Instead of simply displaying statistics, we wanted to build an experience where readers could compare evidence, challenge assumptions and think like basketball decision-makers."
    ],
    takeaway:
      "The goal is not to replace basketball knowledge with numbers. It is to make that knowledge more informed."
  },
  {
    number: "02",
    label: "WHAT WE EXPLORED",
    title: "Beyond the obvious.",
    paragraphs: [
      "Throughout the project, we explored historical player profiles, projected rotations, roster continuity, player comparisons, evidence-based claims and hypothetical decision scenarios.",
      "Different experiments ask different questions. How does a player's role affect our interpretation of performance? What happens to a rotation when someone becomes unavailable? How much evidence supports a particular basketball claim?",
      "These tools support investigation rather than deliver one definitive answer about which team or player is best."
    ],
    takeaway:
      "The most valuable result is not always a ranking. Sometimes it is discovering which question deserves more attention."
  },
  {
    number: "03",
    label: "WHAT WE LEARNED",
    title: "Context changes everything.",
    paragraphs: [
      "Building these experiments showed why individual statistics should be interpreted alongside minutes, efficiency, playing style, team context and sample size.",
      "The project highlights the difference between describing historical performance and evaluating possible future decisions.",
      "A useful basketball analysis should explain not only what the numbers say, but also what they do not prove."
    ],
    takeaway:
      "Evidence becomes more meaningful when its context and limitations are visible."
  },
  {
    number: "04",
    label: "THE LIMITATIONS",
    title: "What the data cannot tell us.",
    paragraphs: [
      "Historical player metrics describe observed 2025–26 performance. They are not guarantees of future production.",
      "The 2026–27 roster and rotation information represents projections. Hypothetical absence and rotation scenarios represent model outputs, not actual coaching decisions or injury predictions.",
      "Player health, development, chemistry, tactical adjustments and other factors may affect real outcomes in ways that these models cannot fully capture."
    ],
    takeaway:
      "Responsible analytics does not eliminate uncertainty. It helps us understand where uncertainty remains."
  },
  {
    number: "05",
    label: "THE NEXT CHAPTER",
    title: "The season is the real test.",
    paragraphs: [
      "The 2026–27 NBA season creates an opportunity to revisit the project's assumptions using new evidence.",
      "As reliable information becomes available, future versions could update roster information, player production and actual playing time.",
      "Comparing projected roles with observed outcomes would help identify which assumptions were useful, where the models missed and how to improve the next version."
    ],
    takeaway:
      "The next step is not simply adding more data. It is learning from the difference between expectations and reality."
  }
];

const roadmap = [
  {
    number: "01",
    title: "Update the evidence",
    text:
      "Introduce verified 2026–27 roster and performance data as new information becomes available."
  },
  {
    number: "02",
    title: "Test the projections",
    text:
      "Compare projected rotation minutes and roles against observed outcomes."
  },
  {
    number: "03",
    title: "Revisit Player DNA",
    text:
      "Evaluate how player profiles evolve as new games and minutes expand the available samples."
  },
  {
    number: "04",
    title: "Improve the models",
    text:
      "Document errors, reconsider assumptions and refine hypothetical decision scenarios."
  }
];

function Chapter({ chapter }) {
  return (
    <article className="nc-chapter">
      <div className="nc-chapter-label">
        <strong>{chapter.number}</strong>
        <span>{chapter.label}</span>
      </div>

      <div className="nc-chapter-content">
        <h3>{chapter.title}</h3>

        {chapter.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}

        <div className="nc-takeaway">
          <span>THE TAKEAWAY</span>
          <p>{chapter.takeaway}</p>
        </div>
      </div>
    </article>
  );
}

export default function NextChapter() {
  return (
    <section id="the-next-chapter" className="nc-root">
      <div className="nc-container">

        <header className="nc-hero">
          <div className="nc-topline">
            <span>THE FRONT OFFICE / NBA DNA LAB</span>
            <span>PROJECT CLOSING STATEMENT</span>
          </div>

          <p className="nc-overline">
            15 / THE NEXT CHAPTER / 2026–27 AND BEYOND
          </p>

          <h2>
            THE GAME
            <br />
            DOESN'T STOP
            <br />
            <em>HERE.</em>
          </h2>

          <div className="nc-hero-bottom">
            <p>
              Basketball never stands still.
              Neither should the way we analyze it.
            </p>

            <span>
              AN EVOLVING BASKETBALL
              <br />
              ANALYTICS PROJECT
            </span>
          </div>
        </header>

        <div className="nc-intro">
          <span>THE PROJECT IN PERSPECTIVE</span>

          <p>
            THE FRONT OFFICE is not a finished answer
            to how basketball should be evaluated.
            It is a starting point for testing ideas,
            interpreting evidence and improving
            the questions we ask about the game.
          </p>
        </div>

        <div className="nc-chapters">
          {chapters.map((chapter) => (
            <Chapter
              key={chapter.number}
              chapter={chapter}
            />
          ))}
        </div>

        <section className="nc-roadmap">
          <div className="nc-roadmap-heading">
            <span>LOOKING AHEAD</span>

            <h3>
              THE SEASON
              <br />
              IS THE REAL TEST.
            </h3>

            <p>
              Future development should be measured
              by what we verify, improve and explain.
              These are proposed updates, not features
              already running automatically.
            </p>
          </div>

          <div className="nc-roadmap-grid">
            {roadmap.map((item) => (
              <div className="nc-roadmap-item" key={item.number}>
                <span>{item.number}</span>
                <h4>{item.title}</h4>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="nc-methodology">
          <div className="nc-methodology-heading">
            <span>DATA / METHODOLOGY / LIMITATIONS</span>

            <h3>
              TRANSPARENCY
              IS PART OF
              THE ANALYSIS.
            </h3>
          </div>

          <div className="nc-methodology-copy">
            <p>
              The project combines historical 2025–26
              player information, projected 2026–27
              roster data and hypothetical
              scenario-based models.
            </p>

            <p>
              Historical observations describe past
              performance. Projections represent
              assumptions. Simulations explore
              hypothetical conditions.
            </p>

            <p>
              These results should be interpreted
              within their limitations and supplemented
              with film, coaching context and
              other verified information.
            </p>

            <div className="nc-source-list">
              <strong>PROCESSED PROJECT DATASETS</strong>
              <code>front_office_teams_19a.json</code>
              <code>front_office_players_19a.json</code>
              <code>front_office_player_dna_19hf.json</code>
              <code>front_office_universal_summary_19gd.json</code>
              <code>front_office_evidence_room_32a.json</code>
              <code>front_office_war_room_33_2.json</code>
            </div>

            <p className="nc-note">
              These filenames identify processed
              project datasets, not verified original
              provider citations. Upstream attribution
              should be confirmed before publication.
              No live feed or automatic update schedule
              is claimed here.
            </p>
          </div>
        </section>

        <footer className="nc-footer">
          <span>THE FRONT OFFICE / NBA DNA LAB</span>

          <h3>
            STAY CURIOUS.
            <br />
            QUESTION EVERYTHING.
            <br />
            <em>KNOW THE GAME.</em>
          </h3>

          <div className="nc-footer-bottom">
            <p>
              The next insight starts with
              the next question.
            </p>

            <span>
              END OF REPORT
              <br />
              NOT THE END OF THE PROJECT
            </span>
          </div>
        </footer>

      </div>
    </section>
  );
}
