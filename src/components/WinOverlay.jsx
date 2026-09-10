import { useEffect, useRef } from "react";
import { runConfetti } from "../utils/confetti";
import { formatTime } from "../utils/format";

export default function WinOverlay({ moves, elapsedMs, isNewBest, onPlayAgain, onNewPhoto }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return undefined;
    return runConfetti(canvasRef.current);
  }, []);

  return (
    <div className="ipg-win-overlay">
      <canvas ref={canvasRef} className="ipg-confetti-canvas" />
      <div className="ipg-win-card">
        {isNewBest && <div className="ipg-win-badge">🏆 New high score!</div>}
        <h2>You win!</h2>
        <p className="ipg-win-stats">
          {moves} moves · {formatTime(elapsedMs)}
        </p>
        <div className="ipg-win-actions">
          <button className="ipg-btn ipg-btn-primary" onClick={onPlayAgain}>
            Play again
          </button>
          <button className="ipg-btn" onClick={onNewPhoto}>
            New photo
          </button>
        </div>
      </div>
    </div>
  );
}
