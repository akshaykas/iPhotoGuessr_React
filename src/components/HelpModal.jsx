export default function HelpModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="ipg-popover-backdrop" onClick={onClose}>
      <div className="ipg-popover" onClick={e => e.stopPropagation()}>
        <div className="ipg-popover-header">
          <span>How to play</span>
          <button className="ipg-icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <ul className="ipg-help-list">
          <li>Click or tap a tile next to the empty space to slide it.</li>
          <li>Use the arrow keys to slide tiles from the keyboard.</li>
          <li>Recreate the reference photo shown in the sidebar.</li>
          <li>Change the size, pick a new photo, or upload your own anytime.</li>
          <li>Your best moves and time are saved for each puzzle size.</li>
        </ul>
      </div>
    </div>
  );
}
