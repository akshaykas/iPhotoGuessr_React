import { useCallback, useRef } from "react";

export function useSound(enabled) {
  const ctxRef = useRef(null);

  function ensureCtx() {
    if (!ctxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) ctxRef.current = new AudioCtx();
    }
    return ctxRef.current;
  }

  const beep = useCallback(
    ({ freq = 440, duration = 0.08, type = "sine", gain = 0.05, delay = 0 }) => {
      if (!enabled) return;
      const ctx = ensureCtx();
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();
      const t0 = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
      osc.connect(g).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + duration + 0.02);
    },
    [enabled]
  );

  const playMove = useCallback(() => beep({ freq: 380, duration: 0.05, gain: 0.04 }), [beep]);
  const playError = useCallback(
    () => beep({ freq: 160, duration: 0.08, type: "square", gain: 0.03 }),
    [beep]
  );
  const playWin = useCallback(() => {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) =>
      beep({ freq, duration: 0.18, gain: 0.06, delay: i * 0.09 })
    );
  }, [beep]);

  return { playMove, playError, playWin };
}
