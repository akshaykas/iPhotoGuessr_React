import React, { useEffect, useMemo, useRef, useState } from "react";

export default function App() {
    const DEFAULT_IMG =
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop";
    const [imgSrc, setImgSrc] = useState(DEFAULT_IMG);
    const [size, setSize] = useState(4);
    const [tiles, setTiles] = useState(() => makeSolved(4));
    const [moves, setMoves] = useState(0);
    const [shuffling, setShuffling] = useState(false);

    // --- Responsive bits ---
    const containerRef = useRef(null);
    const [vw, setVw] = useState(window.innerWidth);
    const [vh, setVh] = useState(window.innerHeight);
    const isMobile = vw <= 768;
    const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    useEffect(() => {
        // keep in sync with viewport changes, address mobile URL bar shifts via resize + orientation changes
        const onResize = () => {
            setVw(window.innerWidth);
            setVh(window.innerHeight);
        };
        window.addEventListener("resize", onResize, { passive: true });
        window.addEventListener("orientationchange", onResize, { passive: true });
        return () => {
            window.removeEventListener("resize", onResize);
            window.removeEventListener("orientationchange", onResize);
        };
    }, []);

    const N = size * size;
    const blankIndex = tiles.indexOf(N - 1);
    const solved = useMemo(() => tiles.every((v, i) => v === i), [tiles]);

    useEffect(() => {
        setTiles(makeSolved(size));
        setMoves(0);
    }, [size]);

    // Board dimension (px) — pick a comfy size that fits on small screens
    const boardPx = (() => {
        // Leave room for controls; pick the tighter bound of width and height.
        const maxByWidth = Math.min(vw * 0.92, 560);
        const maxByHeight = Math.min(vh * 0.55, 520); // a bit shorter to fit controls on mobile
        return Math.floor(isMobile ? Math.min(maxByWidth, maxByHeight) : Math.min(vw * 0.6, 520));
    })();

    // --- Helpers ---
    function makeSolved(s) {
        return Array.from({ length: s * s }, (_, i) => i);
    }
    function idxToRC(i) {
        return { r: Math.floor(i / size), c: i % size };
    }
    function isNeighbor(i, j) {
        const a = idxToRC(i);
        const b = idxToRC(j);
        const dr = Math.abs(a.r - b.r);
        const dc = Math.abs(a.c - b.c);
        return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
    }
    function move(i) {
        if (solved || !isNeighbor(i, blankIndex)) return;
        setTiles((prev) => {
            const next = prev.slice();
            [next[i], next[blankIndex]] = [next[blankIndex], next[i]];
            return next;
        });
        setMoves((m) => m + 1);
    }

    async function shuffle() {
        setShuffling(true);
        const attemptsCap = 500;
        for (let attempt = 0; attempt < attemptsCap; attempt++) {
            const p = makeSolved(size);
            for (let i = p.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [p[i], p[j]] = [p[j], p[i]];
            }
            if (isSolvable(p, size) && !p.every((v, i) => v === i)) {
                setTiles(p);
                setMoves(0);
                break;
            }
            await new Promise((r) => setTimeout(r, 0));
        }
        setShuffling(false);
    }

    function isSolvable(permutation, s) {
        const arr = permutation.filter((v) => v !== permutation.length - 1);
        const inversions = countInversions(arr);
        if (s % 2 === 1) return inversions % 2 === 0;
        const blankPos = permutation.indexOf(permutation.length - 1);
        const r = Math.floor(blankPos / s);
        const blankRowFromBottom = s - r;
        return blankRowFromBottom % 2 === 0 ? inversions % 2 === 1 : inversions % 2 === 0;
    }

    function countInversions(arr) {
        let inv = 0;
        for (let i = 0; i < arr.length; i++) {
            for (let j = i + 1; j < arr.length; j++) {
                if (arr[i] > arr[j]) inv++;
            }
        }
        return inv;
    }

    function onUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setImgSrc(String(ev.target?.result || DEFAULT_IMG));
        reader.readAsDataURL(file);
    }

    // --- UI styles (mobile-aware) ---
    const ui = {
        page: {
            minHeight: "100svh",
            display: "grid",
            placeItems: "center",
            background:
                "radial-gradient(1200px 600px at 10% -10%, #a78bfa33, transparent), radial-gradient(1000px 500px at 110% 10%, #60a5fa33, transparent), linear-gradient(160deg, #0b1020, #121826 60%, #0b1020)",
            color: "#e6ebff",
            fontFamily:
                "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji",
            padding: isMobile ? "14px" : "24px",
        },
        card: {
            width: isMobile ? "min(96vw, 860px)" : "min(92vw, 980px)",
            borderRadius: "18px",
            background: "linear-gradient(180deg, #1a2236cc, #121826cc)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 12px 40px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.04)",
            border: "1px solid rgba(255,255,255,.06)",
            padding: isMobile ? "14px" : "20px",
        },
        header: {
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "stretch" : "center",
            justifyContent: isMobile ? "flex-start" : "space-between",
            gap: isMobile ? "10px" : "12px",
            marginBottom: "14px",
        },
        title: { fontSize: isMobile ? "18px" : "20px", fontWeight: 700, letterSpacing: ".3px" },
        controls: {
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            alignItems: "center",
            width: isMobile ? "100%" : "auto",
        },
        select: {
            background: "#0f1526",
            color: "#e6ebff",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: "12px",
            padding: isMobile ? "12px 14px" : "10px 12px",
            fontSize: isMobile ? "16px" : "14px",
            outline: "none",
            width: isMobile ? "100%" : "auto",
            touchAction: "manipulation",
        },
        button: (variant = "primary") => ({
            cursor: "pointer",
            border: "1px solid transparent",
            borderRadius: "14px",
            padding: isMobile ? "12px 16px" : "10px 14px",
            fontSize: isMobile ? "16px" : "14px",
            fontWeight: 700,
            letterSpacing: ".2px",
            width: isMobile ? "100%" : "auto",
            background:
                variant === "danger"
                    ? "linear-gradient(180deg,#ef444433,#b91c1c33)"
                    : "linear-gradient(180deg,#2563eb33,#1d4ed833)",
            color: "#e6ebff",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.05)",
            transition: prefersReducedMotion
                ? "none"
                : "transform .06s ease, filter .2s ease, border-color .2s ease",
            touchAction: "manipulation",
        }),
        row: {
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr auto",
            gap: isMobile ? "14px" : "20px",
            alignItems: "start",
        },
        boardWrap: { display: "grid", placeItems: "center", padding: isMobile ? "4px" : "8px" },
        board: {
            width: `${boardPx}px`,
            height: `${boardPx}px`,
            display: "grid",
            gap: isMobile ? "4px" : "6px",
            background: "rgba(255,255,255,.04)",
            borderRadius: "16px",
            padding: isMobile ? "4px" : "6px",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.03)",
            border: "1px solid rgba(255,255,255,.06)",
            touchAction: "manipulation",
        },
        tile: {
            position: "relative",
            borderRadius: "12px",
            boxShadow: "0 8px 20px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.06)",
            overflow: "hidden",
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            userSelect: "none",
            transition: prefersReducedMotion ? "none" : "transform 120ms ease, box-shadow 200ms ease",
            display: "grid",
            placeItems: "center",
            color: "rgba(255,255,255,.92)",
            fontSize: isMobile ? "clamp(12px, 3.2vw, 18px)" : "clamp(10px, 2.2vw, 18px)",
            fontWeight: 800,
            letterSpacing: ".3px",
            border: "1px solid rgba(255,255,255,.06)",
            touchAction: "manipulation",
        },
        sidebar: {
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            minWidth: isMobile ? "unset" : "220px",
        },
        hint: { fontSize: "12px", opacity: 0.8, lineHeight: 1.5 },
        badge: {
            display: "inline-block",
            fontSize: isMobile ? "12px" : "12px",
            padding: isMobile ? "5px 9px" : "6px 10px",
            borderRadius: "999px",
            background: "rgba(99,102,241,.15)",
            border: "1px solid rgba(99,102,241,.35)",
            color: "#c7d2fe",
        },
    };

    const boardStyle = {
        ...ui.board,
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        gridTemplateRows: `repeat(${size}, 1fr)`,
    };

    function bgPositionForValue(v) {
        const r = Math.floor(v / size);
        const c = v % size;
        const step = 100 / (size - 1 || 1);
        return `${c * step}% ${r * step}%`;
    }

    return (
        <div style={ui.page}>
            <div style={ui.card}>
                <div style={ui.header}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
                        <span style={ui.title}>✨ Slide Puzzle</span>
                        <span style={ui.badge}>
                            {size}×{size}
                        </span>
                    </div>

                    <div style={ui.controls}>
                        <label style={{ display: "flex", alignItems: "center", gap: 8, width: isMobile ? "100%" : "auto" }}>
                            <span style={{ fontSize: isMobile ? 14 : 13, opacity: 0.8, minWidth: 36 }}>Size</span>
                            <select
                                style={ui.select}
                                value={size}
                                onChange={(e) => setSize(Number(e.target.value))}
                                disabled={shuffling}
                            >
                                {[3, 4, 5, 6].map((n) => (
                                    <option key={n} value={n}>
                                        {n} × {n}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label style={{ ...ui.button(), display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                            <input type="file" accept="image/*" onChange={onUpload} style={{ display: "none" }} disabled={shuffling} />
                            Upload image
                        </label>

                        <button
                            onClick={shuffle}
                            style={ui.button()}
                            disabled={shuffling}
                            title="Shuffle into a solvable configuration"
                        >
                            {shuffling ? "Shuffling…" : "Shuffle"}
                        </button>

                        <button
                            onClick={() => {
                                setTiles(makeSolved(size));
                                setMoves(0);
                            }}
                            style={ui.button("danger")}
                            disabled={shuffling}
                            title="Reset to solved state"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                <div style={ui.row}>
                    <div ref={containerRef} style={ui.boardWrap}>
                        <div style={boardStyle}>
                            {tiles.map((v, i) => {
                                const isBlank = v === N - 1;
                                const canMove = isNeighbor(i, blankIndex);
                                const tileStyle = {
                                    ...ui.tile,
                                    cursor: !isBlank && canMove ? "pointer" : isBlank ? "default" : "not-allowed",
                                    backgroundImage: isBlank ? "none" : `url("${imgSrc}")`,
                                    backgroundSize: `${size * 100}% ${size * 100}%`,
                                    backgroundPosition: isBlank ? "center" : bgPositionForValue(v),
                                    filter: isBlank ? "saturate(0) opacity(.12)" : "none",
                                    outline: canMove && !isBlank ? "1px solid rgba(99,102,241,.6)" : "1px solid rgba(255,255,255,.06)",
                                };
                                return (
                                    <div
                                        key={`${v}-${i}`}
                                        onClick={() => !isBlank && move(i)}
                                        style={tileStyle}
                                        onMouseDown={(e) => {
                                            if (!prefersReducedMotion && !isBlank && canMove) e.currentTarget.style.transform = "scale(.98)";
                                        }}
                                        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                                        aria-label={isBlank ? "blank" : `tile ${v + 1}`}
                                        role="button"
                                    >
                                        {!isBlank && (
                                            <span
                                                style={{
                                                    position: "absolute",
                                                    bottom: isMobile ? 4 : 6,
                                                    right: isMobile ? 6 : 8,
                                                    padding: isMobile ? "3px 6px" : "4px 8px",
                                                    borderRadius: 8,
                                                    background: "rgba(0,0,0,.35)",
                                                    fontWeight: 800,
                                                    fontSize: isMobile ? 12 : 12,
                                                    letterSpacing: ".3px",
                                                }}
                                            >
                                                {v + 1}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <aside style={ui.sidebar}>
                        <div
                            style={{
                                padding: isMobile ? "12px 12px" : "14px 16px",
                                borderRadius: 14,
                                background: "linear-gradient(180deg,#0f1526aa,#0c1223aa)",
                                border: "1px solid rgba(255,255,255,.06)",
                                boxShadow: "inset 0 1px 0 rgba(255,255,255,.04)",
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <span style={{ opacity: 0.8 }}>Moves</span>
                                <strong>{moves}</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ opacity: 0.8 }}>Status</span>
                                <strong style={{ color: solved ? "#86efac" : "#c7d2fe" }}>
                                    {solved ? "Solved 🎉" : "In progress"}
                                </strong>
                            </div>
                        </div>

                        <div
                            style={{
                                padding: isMobile ? "12px 12px" : "14px 16px",
                                borderRadius: 14,
                                background: "linear-gradient(180deg,#0f1526aa,#0c1223aa)",
                                border: "1px solid rgba(255,255,255,.06)",
                                boxShadow: "inset 0 1px 0 rgba(255,255,255,.04)",
                            }}
                        >
                            <div style={{ marginBottom: 8, fontWeight: 700, letterSpacing: ".2px" }}>How to play</div>
                            <p style={ui.hint}>
                                Tap a tile next to the blank space to slide it. Recreate the original picture. Use{" "}
                                <em>Shuffle</em> to start a new solvable puzzle. Upload your own image for fun!
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
