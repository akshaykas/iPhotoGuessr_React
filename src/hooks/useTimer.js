import { useEffect, useRef, useState } from "react";

export function useTimer(running) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef(null);

  useEffect(() => {
    if (!running) return undefined;
    startRef.current = Date.now() - elapsedMs;
    const id = setInterval(() => {
      setElapsedMs(Date.now() - startRef.current);
    }, 500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function reset() {
    setElapsedMs(0);
    startRef.current = null;
  }

  return { elapsedMs, reset };
}
