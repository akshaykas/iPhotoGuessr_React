export default function Header({ theme, onToggleTheme, soundOn, onToggleSound, onShowHelp, size }) {
  return (
    <header className="ipg-header">
      <div className="ipg-brand">
        <span className="ipg-logo" aria-hidden="true">🧩</span>
        <div>
          <h1>iPhotoGuessr</h1>
          <span className="ipg-subtitle">Slide puzzle · {size}×{size}</span>
        </div>
      </div>
      <div className="ipg-header-actions">
        <button className="ipg-icon-btn" onClick={onShowHelp} title="How to play" aria-label="How to play">
          ?
        </button>
        <button
          className="ipg-icon-btn"
          onClick={onToggleSound}
          title={soundOn ? "Mute sound" : "Unmute sound"}
          aria-label={soundOn ? "Mute sound" : "Unmute sound"}
          aria-pressed={soundOn}
        >
          {soundOn ? "🔊" : "🔇"}
        </button>
        <button
          className="ipg-icon-btn"
          onClick={onToggleTheme}
          title="Toggle theme"
          aria-label="Toggle theme"
          aria-pressed={theme === "light"}
        >
          {theme === "dark" ? "🌙" : "☀️"}
        </button>
      </div>
    </header>
  );
}
