export default function Toolbar({
  size,
  onSizeChange,
  onOpenPicker,
  onShuffle,
  onRestart,
  shuffling,
  showNumbers,
  onToggleNumbers,
}) {
  return (
    <div className="ipg-toolbar">
      <label className="ipg-field">
        <span>Size</span>
        <select value={size} onChange={e => onSizeChange(Number(e.target.value))} disabled={shuffling}>
          {[2, 3, 4, 5, 6].map(n => (
            <option key={n} value={n}>
              {n} × {n}
            </option>
          ))}
        </select>
      </label>

      <button className="ipg-btn" onClick={onOpenPicker} disabled={shuffling}>
        🖼️ Change photo
      </button>

      <button className="ipg-btn ipg-btn-primary" onClick={onShuffle} disabled={shuffling}>
        {shuffling ? "Shuffling…" : "🔀 New game"}
      </button>

      <button className="ipg-btn ipg-btn-ghost" onClick={onRestart} disabled={shuffling}>
        ↺ Restart
      </button>

      <button
        className={`ipg-btn ipg-btn-icon${showNumbers ? " is-active" : ""}`}
        onClick={onToggleNumbers}
        title="Toggle tile numbers"
        aria-label="Toggle tile numbers"
        aria-pressed={showNumbers}
      >
        #
      </button>
    </div>
  );
}
