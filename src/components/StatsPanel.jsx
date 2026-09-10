import { formatTime } from "../utils/format";

export default function StatsPanel({ moves, elapsedMs, best, progress, imgSrc, solved }) {
  return (
    <aside className="ipg-sidebar">
      <div className="ipg-stat-card">
        <div className="ipg-stat-row">
          <span>Moves</span>
          <strong>{moves}</strong>
        </div>
        <div className="ipg-stat-row">
          <span>Time</span>
          <strong>{formatTime(elapsedMs)}</strong>
        </div>
        <div className="ipg-stat-row">
          <span>Status</span>
          <strong className={solved ? "ipg-status-solved" : "ipg-status-progress"}>
            {solved ? "Solved 🎉" : "In progress"}
          </strong>
        </div>
        <div className="ipg-progress-track">
          <div className="ipg-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {best && (
        <div className="ipg-stat-card">
          <div className="ipg-stat-title">Best on this size</div>
          <div className="ipg-stat-row">
            <span>Moves</span>
            <strong>{best.moves}</strong>
          </div>
          <div className="ipg-stat-row">
            <span>Time</span>
            <strong>{formatTime(best.timeMs)}</strong>
          </div>
        </div>
      )}

      <div className="ipg-stat-card ipg-reference-card">
        <div className="ipg-stat-title">Reference</div>
        <img className="ipg-reference-thumb" src={imgSrc} alt="Puzzle reference" />
      </div>
    </aside>
  );
}
