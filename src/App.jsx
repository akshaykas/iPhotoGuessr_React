import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PhotoDateGuess from "./PhotoDateGuess";

// --- Tiny helper to load an <img> with a skeleton/spinner promise ---
function loadImageWithSkeleton(imgEl, url, { onShow, onHide }) {
    if (!imgEl) return Promise.reject(new Error("No image element"));
    onShow?.();
    return new Promise((resolve, reject) => {
        const cleanup = () => { imgEl.onload = null; imgEl.onerror = null; };
        imgEl.onload = () => { onHide?.(); cleanup(); resolve(); };
        imgEl.onerror = () => { onHide?.(); cleanup(); reject(new Error("Failed to load image.")); };
        const finalUrl = url + (url.includes("?") ? "&" : "?") + "ts=" + Date.now();
        imgEl.src = finalUrl;
    });
}

function Badge({ label, className }) {
    if (!label) return null;
    return <span className={`badge ${className || "text-bg-secondary"}`}>{label}</span>;
}

function Hints({ hints }) {
    if (!hints || !hints.level) return null;
    return (
        <div className="row g-2 mt-2" id="hintsRow">
            {hints.month && (
                <div className="col-12" id="hintMonth">Hint 1: Month = {hints.month}</div>
            )}
            {hints.day && (
                <div className="col-12" id="hintDay">Hint 2: Day = {hints.day}</div>
            )}
            {hints.year && (
                <div className="col-12" id="hintYear">Hint 3: Year = {hints.year}</div>
            )}
        </div>
    );
}

function SettingsPanel({ onReload }) {
    const [status, setStatus] = useState("");
    const inputRef = useRef(null);

    const refreshCurrentRoot = useCallback(async () => {
        try {
            const r = await fetch("/api/settings/photo-root", { cache: "no-store" });
            const j = await r.json();
            setStatus(r.ok ? `Current folder: ${j.root}` : j.error || "Unable to get current folder");
        } catch {
            setStatus("Unable to get current folder");
        }
    }, []);

    const setRootFromInput = useCallback(async () => {
        const input = inputRef.current;
        if (!input) return;
        const root = input.value.trim();
        if (!root) {
            setStatus("Enter a folder path.");
            return;
        }
        try {
            const r = await fetch("/api/settings/photo-root", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ root })
            });
            const j = await r.json();
            if (!r.ok) {
                setStatus(j.error || "Failed to set folder.");
                return;
            }
            setStatus(`Now using: ${j.root}`);
            onReload?.();
        } catch {
            setStatus("Failed to set folder.");
        }
    }, [onReload]);

    useEffect(() => {
        // show current on first load
        refreshCurrentRoot();
    }, [refreshCurrentRoot]);

    return (
        <div className="card mt-3">
            <div className="card-body">
                <h5 className="card-title">Settings</h5>
                <div className="d-flex gap-2 align-items-center flex-wrap">
                    <input ref={inputRef} className="form-control" style={{ maxWidth: 420 }} placeholder="Enter photo root folder path" />
                    <button className="btn btn-primary" id="btnSetRoot" onClick={setRootFromInput}>Set Root</button>
                    <button className="btn btn-outline-secondary" id="btnShowRoot" onClick={refreshCurrentRoot}>Show Current</button>
                </div>
                <div className="mt-2" id="rootStatus">{status}</div>
            </div>
        </div>
    );
}

export default function App() {
    // --- state ---
    const [currentId, setCurrentId] = useState(null);
    const [statusMsg, setStatusMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [badge, setBadge] = useState({ label: "", className: "" });
    const [hints, setHints] = useState(null);
    const [guess, setGuess] = useState("");

    const imgRef = useRef(null);

    const clearResultBadge = useCallback(() => {
        setBadge({ label: "Make a guess", className: "fs-5 px-3 py-2 text-bg-secondary d-none" });
    }, []);

    const setResultBadge = useCallback((label, className) => {
        setBadge({ label, className });
    }, []);

    const clearHints = useCallback(() => setHints(null), []);

    const showSkeleton = useCallback(() => setLoading(true), []);
    const hideSkeleton = useCallback(() => setLoading(false), []);

    const nextPhoto = useCallback(async () => {
        const img = imgRef.current;
        clearResultBadge();
        clearHints();
        setStatusMsg("Loading photo...");
        showSkeleton();

        try {
            const r = await fetch("/api/photo/random", { cache: "no-store" });
            if (!r.ok) throw new Error("No images found.");
            const { id } = await r.json();
            setCurrentId(id);

            await loadImageWithSkeleton(
                img,
                `/api/photo/${id}/image`,
                { onShow: showSkeleton, onHide: hideSkeleton }
            );

            setStatusMsg("Photo loaded. Make your guess!");
        } catch (e) {
            hideSkeleton();
            setStatusMsg(e.message || "Failed to load.");
        }
    }, [clearHints, clearResultBadge, hideSkeleton, showSkeleton]);

    const submitGuess = useCallback(async () => {
        if (!currentId) return;
        try {
            const r = await fetch(`/api/photo/${currentId}/guess`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ guess })
            });
            const data = await r.json();

            if (!r.ok || data.explanation) {
                setResultBadge(data.explanation || "Unable to score that photo.", "text-bg-secondary fs-5 px-3 py-2");
                return;
            }

            const days = Number(data.daysOff ?? 0);
            const label = days === 0 ? "Spot on!" : `Off by ${days} day${days === 1 ? "" : "s"}`;
            const cls = days === 0
                ? "text-bg-success fs-5 px-3 py-2"
                : "bg-light text-danger border border-danger-subtle fs-3 fw-semibold px-3 py-2";

            setResultBadge(label, cls);
            setHints(data.hints || null);
        } catch (e) {
            setResultBadge(e.message || "Failed to submit guess.", "text-bg-secondary fs-5 px-3 py-2");
        }
    }, [currentId, guess, setResultBadge]);

    useEffect(() => {
        // Load on first mount
        nextPhoto();
    }, [nextPhoto]);

    // Derived UI bits
    const photoBadge = useMemo(() => {
        if (loading) return { label: "Loading", className: "text-bg-warning" };
        if (!currentId) return { label: "", className: "" };
        return { label: "Ready", className: "text-bg-success" };
    }, [loading, currentId]);

    return (
        <div className="container py-3">
            <h2 className="mb-3">ImageDateGuessor</h2>

            {/* Status Row */}
            <div className="d-flex align-items-center gap-2 mb-2">
                <Badge label={photoBadge.label} className={photoBadge.className} />
                <div id="statusMsg">{statusMsg}</div>
                {loading && (
                    <div id="loadingSpinner" className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true" />
                )}
            </div>

            {/* Image + Skeleton */}
            <div className="position-relative" style={{ minHeight: 280 }}>
                {/* Skeleton */}
                {loading && (
                    <div id="imgSkeleton" className="d-flex align-items-center justify-content-center bg-light rounded position-absolute top-0 start-0 w-100 h-100">
                        <div className="placeholder-glow w-100 h-100 d-flex align-items-center justify-content-center">
                            <div className="placeholder col-6" style={{ height: 240 }} />
                        </div>
                    </div>
                )}
                <img
                    id="photo"
                    ref={imgRef}
                    alt="Guess the date"
                    className="img-fluid rounded shadow"
                    style={{ display: loading ? "none" : "block", maxHeight: 480 }}
                />
            </div>

            {/* Guess Input */}
            <div className="input-group mt-3" style={{ maxWidth: 420 }}>
                <input
                    id="guess"
                    className="form-control"
                    placeholder="Enter your guess (YYYY-MM-DD or natural language)"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitGuess()}
                />
                <button id="submit" className="btn btn-primary" onClick={submitGuess} disabled={!currentId}>Submit</button>
            </div>

            {/* Result Badge */}
            <div className="mt-2">
                <Badge label={badge.label} className={badge.className} />
            </div>

            {/* Hints */}
            <Hints hints={hints} />

            {/* Controls */}
            <div className="mt-3 d-flex gap-2">
                <button id="next" className="btn btn-outline-secondary" onClick={nextPhoto}>Next Photo</button>
            </div>

            {/* Settings */}
            <SettingsPanel onReload={nextPhoto} />
        </div>

    );

    return <PhotoDateGuess />;
}