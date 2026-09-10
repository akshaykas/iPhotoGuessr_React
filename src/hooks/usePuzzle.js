import { useCallback, useEffect, useRef, useState } from "react";
import { isNeighbor, isSolvable, isSolved, makeSolved } from "../utils/puzzleUtils";

export function usePuzzle(size) {
  const [rawTiles, setTiles] = useState(() => makeSolved(size));
  const [moves, setMoves] = useState(0);
  const [shuffling, setShuffling] = useState(false);
  const [roundId, setRoundId] = useState(0);
  const initialRef = useRef(rawTiles);

  // Guards the one render between a size change and the shuffle effect
  // that follows it, where `rawTiles` is still sized for the old grid.
  const tiles = rawTiles.length === size * size ? rawTiles : makeSolved(size);

  const blankIndex = tiles.indexOf(size * size - 1);
  const solved = isSolved(tiles, size);

  const shuffle = useCallback(async () => {
    setShuffling(true);
    const attemptsCap = 500;
    for (let attempt = 0; attempt < attemptsCap; attempt++) {
      const p = makeSolved(size);
      for (let i = p.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [p[i], p[j]] = [p[j], p[i]];
      }
      if (isSolvable(p, size) && !isSolved(p, size)) {
        initialRef.current = p;
        setTiles(p);
        setMoves(0);
        setRoundId(id => id + 1);
        break;
      }
      await new Promise(r => setTimeout(r, 0));
    }
    setShuffling(false);
  }, [size]);

  useEffect(() => {
    shuffle();
    // Reshuffle whenever the grid size changes; `shuffle` itself is stable per size.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  const restart = useCallback(() => {
    setTiles(initialRef.current.slice());
    setMoves(0);
    setRoundId(id => id + 1);
  }, []);

  const move = useCallback(
    i => {
      if (solved) return false;
      const bi = tiles.indexOf(size * size - 1);
      if (!isNeighbor(i, bi, size)) return false;
      setTiles(prev => {
        const next = prev.slice();
        const b = prev.indexOf(size * size - 1);
        [next[i], next[b]] = [next[b], next[i]];
        return next;
      });
      setMoves(m => m + 1);
      return true;
    },
    [tiles, solved, size]
  );

  return { tiles, moves, blankIndex, solved, shuffling, roundId, move, shuffle, restart };
}
