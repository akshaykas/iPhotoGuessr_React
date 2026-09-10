import { useEffect, useState } from "react";

export function useImageLoader(src) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!src) {
      setStatus("idle");
      return undefined;
    }
    let cancelled = false;
    setStatus("loading");
    const img = new Image();
    img.onload = () => !cancelled && setStatus("loaded");
    img.onerror = () => !cancelled && setStatus("error");
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return status;
}
