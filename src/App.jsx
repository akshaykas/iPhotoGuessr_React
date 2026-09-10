import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import Header from "./components/Header";
import Toolbar from "./components/Toolbar";
import Board from "./components/Board";
import StatsPanel from "./components/StatsPanel";
import WinOverlay from "./components/WinOverlay";
import ImagePicker from "./components/ImagePicker";
import HelpModal from "./components/HelpModal";
import { usePuzzle } from "./hooks/usePuzzle";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useTimer } from "./hooks/useTimer";
import { useSound } from "./hooks/useSound";
import { useViewportSize } from "./hooks/useViewportSize";
import { useImageLoader } from "./hooks/useImageLoader";
import { useElementSize } from "./hooks/useElementSize";
import { computeLayout } from "./utils/layout";
import { PRESET_IMAGES } from "./utils/presets";

const BEST_KEY = "ipg.best.v1";

export default function App() {
  const [theme, setTheme] = useLocalStorage("ipg.theme", "dark");
  const [soundOn, setSoundOn] = useLocalStorage("ipg.sound", true);
  const [showNumbers, setShowNumbers] = useLocalStorage("ipg.numbers", true);
  const [size, setSize] = useLocalStorage("ipg.size", 3);
  const [imgSrc, setImgSrc] = useLocalStorage("ipg.image", PRESET_IMAGES[0].url);
  const [bestBySize, setBestBySize] = useLocalStorage(BEST_KEY, {});
  const [pickerOpen, setPickerOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [justNewBest, setJustNewBest] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const { width: vw, height: vh } = useViewportSize();
  const isStacked = vw <= 768;
  const isNarrow = vw <= 640;
  const [chromeRef, chromeSize] = useElementSize();
  const [sidebarRef, sidebarSize] = useElementSize();
  const [imgRef, imgSize] = useElementSize();

  // Everything in the sidebar except the photo itself (stat cards, "best"
  // card when it's showing, titles, gaps) — measured directly rather than
  // estimated, so it stays correct no matter which cards happen to be
  // visible. Falls back to a reasonable guess only until the very first
  // ResizeObserver report lands.
  const otherSidebarH =
    sidebarSize.height && imgSize.height ? Math.max(0, sidebarSize.height - imgSize.height) : 190;

  const { boardPx, imageCapPx: referenceCapPx, sidebarMaxHeightPx } = computeLayout({
    vw,
    vh,
    isStacked,
    isNarrow,
    chromeH: chromeSize.height || 96,
    otherSidebarH,
  });
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const { tiles, moves, blankIndex, solved, shuffling, roundId, move, shuffle, restart } = usePuzzle(size);
  const timer = useTimer(moves > 0 && !solved);
  const sound = useSound(soundOn);
  const imageStatus = useImageLoader(imgSrc);

  // Every new round (shuffle/restart) starts its own clock and clears any win screen.
  useEffect(() => {
    timer.reset();
    setShowWin(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundId]);

  const best = bestBySize[size];

  useEffect(() => {
    // moves === 0 means this is a fresh/solved initial board, not a real win.
    if (!solved || moves === 0) return;
    sound.playWin();
    const timeMs = timer.elapsedMs;
    let isBest = false;
    setBestBySize(prev => {
      const current = prev[size];
      if (!current || moves < current.moves || (moves === current.moves && timeMs < current.timeMs)) {
        isBest = true;
        return { ...prev, [size]: { moves, timeMs } };
      }
      return prev;
    });
    setJustNewBest(isBest);
    setShowWin(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solved]);

  const handleTileClick = useCallback(
    index => {
      const ok = move(index);
      if (ok) sound.playMove();
      else sound.playError();
    },
    [move, sound.playMove, sound.playError]
  );

  const handleSelectPreset = useCallback(
    url => {
      setImgSrc(url);
      setPickerOpen(false);
      shuffle();
    },
    [setImgSrc, shuffle]
  );

  const handleUpload = useCallback(
    file => {
      const reader = new FileReader();
      reader.onload = ev => {
        setImgSrc(String(ev.target?.result || ""));
        setPickerOpen(false);
        shuffle();
      };
      reader.readAsDataURL(file);
    },
    [setImgSrc, shuffle]
  );

  const progress = useMemo(() => {
    let correct = 0;
    for (let i = 0; i < tiles.length - 1; i++) if (tiles[i] === i) correct++;
    return Math.round((correct / (tiles.length - 1)) * 100);
  }, [tiles]);

  return (
    <div className="ipg-page">
      <div className="ipg-card">
        <div className="ipg-chrome" ref={chromeRef}>
          <Header
            theme={theme}
            onToggleTheme={() => setTheme(t => (t === "dark" ? "light" : "dark"))}
            soundOn={soundOn}
            onToggleSound={() => setSoundOn(s => !s)}
            onShowHelp={() => setHelpOpen(true)}
            size={size}
          />

          <Toolbar
            size={size}
            onSizeChange={setSize}
            onOpenPicker={() => setPickerOpen(true)}
            onShuffle={shuffle}
            onRestart={restart}
            shuffling={shuffling}
            showNumbers={showNumbers}
            onToggleNumbers={() => setShowNumbers(v => !v)}
          />
        </div>

        <div className="ipg-layout">
          <div className="ipg-board-wrap">
            <Board
              size={size}
              tiles={tiles}
              blankIndex={blankIndex}
              solved={solved}
              imgSrc={imgSrc}
              showNumbers={showNumbers}
              boardPx={boardPx}
              onTileClick={handleTileClick}
              imageStatus={imageStatus}
              reducedMotion={prefersReducedMotion}
            />
          </div>

          <StatsPanel
            ref={sidebarRef}
            imgRef={imgRef}
            moves={moves}
            elapsedMs={timer.elapsedMs}
            best={best}
            progress={progress}
            imgSrc={imgSrc}
            solved={solved}
            imgMaxHeight={referenceCapPx}
            maxHeight={sidebarMaxHeightPx}
          />
        </div>
      </div>

      <ImagePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        currentSrc={imgSrc}
        onSelectPreset={handleSelectPreset}
        onUpload={handleUpload}
      />

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />

      {showWin && (
        <WinOverlay
          moves={moves}
          elapsedMs={timer.elapsedMs}
          isNewBest={justNewBest}
          onPlayAgain={shuffle}
          onNewPhoto={() => {
            setShowWin(false);
            setPickerOpen(true);
          }}
        />
      )}
    </div>
  );
}
