export function boardSizePx(vw, vh, isMobile) {
  const maxByWidth = Math.min(vw * 0.92, 560);
  const maxByHeight = Math.min(vh * 0.55, 520);
  if (isMobile) return Math.floor(Math.min(maxByWidth, maxByHeight));
  return Math.floor(Math.min(vw * 0.5, 520));
}
