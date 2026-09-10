import { forwardRef } from "react";
import { formatTime } from "../utils/format";

const StatsPanel = forwardRef(function StatsPanel(
  { moves, elapsedMs, best, progress, imgSrc, solved, imgMaxHeight, imgRef, maxHeight },
  ref
) {
  return (
    <aside ref={ref} className="ipg-sidebar" style={maxHeight ? { maxHeight, overflowY: "auto" } : undefined}>
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
          <div className="ipg-stat-title">High score</div>
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
        <div className="ipg-stat-title">Photo</div>
        <img
          ref={imgRef}
          className="ipg-reference-thumb"
          src={imgSrc}
          alt="Puzzle reference"
          style={imgMaxHeight ? { maxHeight: imgMaxHeight } : undefined}
        />
      </div>
    </aside>
  );
});

export default StatsPanel;
