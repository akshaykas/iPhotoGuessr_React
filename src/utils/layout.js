const BOARD_FLOOR = 180;
const IMAGE_FLOOR = 80;
const SIDEBAR_FLOOR = 120;

// Sizes the board (and, when the sidebar sits beside it, the reference-photo
// thumbnail) to fit whatever vertical space is actually left, using real
// measured heights for the chrome (header+toolbar) and for everything in the
// sidebar except the photo — so it stays correct regardless of which stat
// cards happen to be showing (e.g. the "best" card only appears once a size
// has been solved).
//
// `sidebarMaxHeightPx` is a hard backstop: even after the photo is floored,
// the sidebar's other cards alone can still be taller than the row has room
// for (e.g. on a short, narrow-ish window with the "best" card showing). In
// that case the sidebar gets a scrollbar of its own rather than the whole
// page growing past the viewport.
export function computeLayout({ vw, vh, isStacked, isNarrow, chromeH, otherSidebarH }) {
  const pagePad = isNarrow ? 24 : 48;
  const cardPad = isNarrow ? 32 : 44;
  const cardGap = 18;
  const safety = 8;

  if (isStacked) {
    const stackGap = isNarrow ? 16 : 22;
    const totalBudget = vh - chromeH - pagePad - cardPad - cardGap - stackGap - safety;
    const boardWidthCap = Math.min(vw * 0.92, 560);
    const remaining = totalBudget - otherSidebarH;

    let boardPx;
    let imageCapPx;
    if (remaining >= boardWidthCap + IMAGE_FLOOR) {
      boardPx = boardWidthCap;
      imageCapPx = remaining - boardPx;
    } else {
      boardPx = Math.min(boardWidthCap, Math.max(BOARD_FLOOR, remaining - IMAGE_FLOOR));
      imageCapPx = Math.max(IMAGE_FLOOR, remaining - boardPx);
    }
    const sidebarMaxHeightPx = Math.max(SIDEBAR_FLOOR, totalBudget - boardPx);
    return {
      boardPx: Math.floor(boardPx),
      imageCapPx: Math.floor(imageCapPx),
      sidebarMaxHeightPx: Math.floor(sidebarMaxHeightPx),
    };
  }

  const rowBudget = vh - chromeH - pagePad - cardPad - cardGap - safety;
  const boardWidthCap = Math.min(vw * 0.5, 560);
  const boardPx = Math.floor(Math.min(boardWidthCap, Math.max(BOARD_FLOOR, rowBudget)));
  const imageCapPx = Math.floor(Math.max(IMAGE_FLOOR, rowBudget - otherSidebarH));
  const sidebarMaxHeightPx = Math.floor(Math.max(SIDEBAR_FLOOR, rowBudget));
  return { boardPx, imageCapPx, sidebarMaxHeightPx };
}
