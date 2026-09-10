import { useRef } from "react";
import { PRESET_IMAGES } from "../utils/presets";

export default function ImagePicker({ open, onClose, currentSrc, onSelectPreset, onUpload }) {
  const fileRef = useRef(null);
  if (!open) return null;

  return (
    <div className="ipg-popover-backdrop" onClick={onClose}>
      <div className="ipg-popover" onClick={e => e.stopPropagation()}>
        <div className="ipg-popover-header">
          <span>Choose a photo</span>
          <button className="ipg-icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="ipg-preset-grid">
          {PRESET_IMAGES.map(img => (
            <button
              key={img.id}
              className={`ipg-preset${currentSrc === img.url ? " is-active" : ""}`}
              onClick={() => onSelectPreset(img.url)}
              style={{ backgroundImage: `url("${img.thumb}")` }}
              title={img.label}
            >
              <span>{img.label}</span>
            </button>
          ))}
        </div>
        <button className="ipg-btn ipg-btn-primary ipg-upload-btn" onClick={() => fileRef.current?.click()}>
          Upload your own image
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={e => {
            const file = e.target.files?.[0];
            if (!file) return;
            onUpload(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
