import { useEffect } from "react";
import { bgPositionForValue, idxToRC, isNeighbor } from "../utils/puzzleUtils";

export default function Board({
  size,
  tiles,
  blankIndex,
  solved,
  imgSrc,
  showNumbers,
  boardPx,
  onTileClick,
  imageStatus,
  reducedMotion,
}) {
  const tileGap = size <= 3 ? 6 : 4;
  const tileSize = (boardPx - tileGap * (size + 1)) / size;

  useEffect(() => {
    function onKeyDown(e) {
      const dirs = {
        ArrowUp: { dr: -1, dc: 0 },
        ArrowDown: { dr: 1, dc: 0 },
        ArrowLeft: { dr: 0, dc: -1 },
        ArrowRight: { dr: 0, dc: 1 },
      };
      const dir = dirs[e.key];
      if (!dir) return;
      e.preventDefault();
      const { r: br, c: bc } = idxToRC(blankIndex, size);
      const tr = br + dir.dr;
      const tc = bc + dir.dc;
      if (tr < 0 || tr >= size || tc < 0 || tc >= size) return;
      onTileClick(tr * size + tc);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [blankIndex, size, onTileClick]);

  return (
    <div
      className="ipg-board"
      style={{ width: boardPx, height: boardPx }}
      role="group"
      aria-label={`${size} by ${size} sliding puzzle`}
    >
      {imageStatus === "loading" && (
        <div className="ipg-board-status">
          <span className="ipg-spinner" /> Loading image…
        </div>
      )}
      {imageStatus === "error" && (
        <div className="ipg-board-status ipg-board-status-error">Couldn't load this image. Try another.</div>
      )}
      {tiles.map((value, index) => {
        const isBlank = value === size * size - 1;
        const canMove = !solved && !isBlank && isNeighbor(index, blankIndex, size);
        const { r, c } = idxToRC(index, size);
        const x = tileGap + c * (tileSize + tileGap);
        const y = tileGap + r * (tileSize + tileGap);
        const style = {
          width: tileSize,
          height: tileSize,
          transform: `translate(${x}px, ${y}px)`,
          transition: reducedMotion ? "none" : undefined,
          backgroundImage: isBlank ? "none" : `url("${imgSrc}")`,
          backgroundSize: `${size * 100}% ${size * 100}%`,
          backgroundPosition: isBlank ? "center" : bgPositionForValue(value, size),
        };
        return (
          <div
            key={value}
            className={`ipg-tile${isBlank ? " is-blank" : ""}${canMove ? " is-movable" : ""}${
              solved ? " is-solved" : ""
            }`}
            style={style}
            onClick={() => !isBlank && onTileClick(index)}
            role="button"
            tabIndex={isBlank ? -1 : 0}
            aria-label={isBlank ? "empty space" : `tile ${value + 1}`}
          >
            {!isBlank && showNumbers && <span className="ipg-tile-number">{value + 1}</span>}
          </div>
        );
      })}
    </div>
  );
}
