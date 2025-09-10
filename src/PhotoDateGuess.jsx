// src/components/PhotoDateGuess.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function PhotoDateGuess() {
    const [currentId, setCurrentId] = useState(null);
    const [statusMsg, setStatusMsg] = useState("Pick a photo and submit your guess.");
    const [loading, setLoading] = useState(false);
    const [badge, setBadge] = useState({ label: "Make a guess", className: "badge text-bg-secondary d-none" });
    const [hints, setHints] = useState(null);
    const [guess, setGuess] = useState("");
    const [rootStatus, setRootStatus] = useState("");

    const imgRef = useRef(null);
    const rootInputRef = useRef(null);

    const clearHints = useCallback(() => setHints(null), []);
    const showSkeleton = useCallback(() => setLoading(true), []);
    const hideSkeleton = useCallback(() => setLoading(false), []);

    const nextPhoto = useCallback(async () => {
        clearHints();
        setStatusMsg("Loading photo...");
        showSkeleton();
        try {
            const r = await fetch("/api/photo/random", { cache: "no-store" });
            if (!r.ok) throw new Error("No images found.");
            const { id } = await r.json();
            setCurrentId(id);
            await loadImageWithSkeleton(imgRef.current, `/api/photo/${id}/image`, { onShow: showSkeleton, onHide: hideSkeleton });
            setStatusMsg("Photo loaded. Make your guess!");
        } catch (e) {
            hideSkeleton();
            setStatusMsg(e.message || "Failed to load.");
        }
    }, [clearHints, showSkeleton, hideSkeleton]);

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
                setBadge({ label: data.explanation || "Unable to score that photo.", className: "badge text-bg-secondary fs-5 px-3 py-2" });
                return;
            }

            const days = Number(data.daysOff ?? 0);
            const label = days === 0 ? "Spot on!" : `Off by ${days} day${days === 1 ? "" : "s"}`;
            const cls = days === 0
                ? "badge text-bg-success fs-5 px-3 py-2"
                : "badge bg-light text-danger border border-danger-subtle fs-3 fw-semibold px-3 py-2";

            setBadge({ label, className: cls });
            setHints(data.hints || null);
        } catch (e) {
            setBadge({ label: e.message || "Failed to submit guess.", className: "badge text-bg-secondary fs-5 px-3 py-2" });
        }
    }, [currentId, guess]);

    const photoBadge = useMemo(() => {
        if (loading) return { label: "Loading", className: "badge text-bg-warning" };
        if (!currentId) return { label: "Waiting", className: "badge text-bg-secondary" };
        return { label: "Ready", className: "badge text-bg-success" };
    }, [loading, currentId]);

    // Settings endpoints
    const refreshCurrentRoot = useCallback(async () => {
        try {
            const r = await fetch("/api/settings/photo-root", { cache: "no-store" });
            const j = await r.json();
            setRootStatus(r.ok ? `Current folder: ${j.root}` : (j.error || "Unable to get current folder"));
        } catch {
            setRootStatus("Unable to get current folder");
        }
    }, []);

    const setRootFromInput = useCallback(async () => {
        const input = rootInputRef.current;
        if (!input) return;
        const root = input.value.trim();
        if (!root) { setRootStatus("Enter a folder path."); return; }
        try {
            const r = await fetch("/api/settings/photo-root", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ root })
            });
            const j = await r.json();
            if (!r.ok) { setRootStatus(j.error || "Failed to set folder."); return; }
            setRootStatus(`Now using: ${j.root}`);
            nextPhoto();
        } catch {
            setRootStatus("Failed to set folder.");
        }
    }, [nextPhoto]);

    useEffect(() => {
        refreshCurrentRoot();
        nextPhoto();
    }, [refreshCurrentRoot, nextPhoto]);

    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-lg-8">

                    <div className="d-flex align-items-center mb-3">
                        <i className="bi bi-image-alt me-2 fs-3 text-primary" />
                        <h1 className="h3 mb-0">Photo Date Guess</h1>
                    </div>

                    {/* Photo folder controls */}
                    <div className="row g-2 align-items-end">
                        <div className="col-md-8">
                            <label htmlFor="rootInput" className="form-label">Photo folder</label>
                            <input ref={rootInputRef} id="rootInput" className="form-control" placeholder="C:\\Users\\you\\Pictures\\... or /Users/you/Pictures" />
                        </div>
                        <div className="col-md-4">
                            <div className="d-grid d-md-flex gap-2 justify-content-md-end">
                                <button id="btnSetRoot" className="btn btn-primary" onClick={setRootFromInput}>Use this folder</button>
                                <button id="btnShowRoot" className="btn btn-outline-secondary" onClick={refreshCurrentRoot}>Current</button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-2 small text-muted" id="rootStatus">{rootStatus}</div>

                    {/* Controls */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-body">
                            <div className="row g-2 align-items-end">
                                <div className="col-12 col-md-5">
                                    <label htmlFor="guess" className="form-label mb-1">Pick your guess</label>
                                    <input
                                        id="guess"
                                        type="date"
                                        className="form-control"
                                        value={guess}
                                        onChange={(e) => setGuess(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && submitGuess()}
                                    />
                                </div>
                                <div className="col-12 col-md-7 d-flex gap-2">
                                    <button id="next" type="button" className="btn btn-outline-primary flex-fill" onClick={nextPhoto}>
                                        <i className="bi bi-shuffle me-1" /> Next Photo
                                    </button>
                                    <button id="submit" type="button" className="btn btn-primary flex-fill" onClick={submitGuess} disabled={!currentId}>
                                        <i className="bi bi-check2-circle me-1" /> Submit Guess
                                    </button>
                                </div>
                            </div>

                            <div className="d-flex align-items-center gap-2 mt-3">
                                {loading && <div id="loadingSpinner" className="spinner-border spinner-border-sm text-secondary" role="status" aria-hidden="true" />}
                                <small id="statusMsg" className="text-muted">{statusMsg}</small>
                            </div>

                            {/* Hints */}
                            {hints?.level && (
                                <div id="hintsRow" className="d-flex flex-wrap gap-2 mb-2 mt-2">
                                    {hints.month && <span id="hintMonth" className="badge rounded-pill text-bg-info">Hint 1: Month = {hints.month}</span>}
                                    {hints.day && <span id="hintDay" className="badge rounded-pill text-bg-info">Hint 2: Day = {hints.day}</span>}
                                    {hints.year && <span id="hintYear" className="badge rounded-pill text-bg-info">Hint 3: Year = {hints.year}</span>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Result header */}
                    <div>
                        <label className="form-label fw-semibold">Result</label>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className={badge.className}>{badge.label}</span>
                            <small className="text-muted">{statusMsg}</small>
                        </div>
                    </div>

                    {/* Image & result */}
                    <div className="card app-card shadow-sm">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <span className="fw-semibold">Preview</span>
                            <span className={photoBadge.className} id="photoBadge">{photoBadge.label}</span>
                        </div>
                        <div className="card-body">
                            <div id="photoFrame" className="mb-3 border rounded bg-body position-relative" style={{ height: "min(70vh, 65vw)" }}>
                                {loading && (
                                    <div id="imgSkeleton" className="position-absolute top-0 start-0 w-100 h-100 placeholder-glow">
                                        <span className="placeholder d-block w-100 h-100" />
                                    </div>
                                )}
                                <img
                                    id="photo"
                                    ref={imgRef}
                                    className="position-absolute top-0 start-0 w-100 h-100 rounded"
                                    style={{ objectFit: "contain", display: loading ? "none" : "block" }}
                                    alt="Selected photo"
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
