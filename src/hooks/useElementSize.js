import { useEffect, useRef, useState } from "react";

export function useElementSize() {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;
      // Use the full border box (not entry.contentRect, which excludes
      // padding/border) so elements with their own padding or border are
      // measured as the space they actually occupy in the layout.
      const { width, height } = entry.target.getBoundingClientRect();
      setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, size];
}
