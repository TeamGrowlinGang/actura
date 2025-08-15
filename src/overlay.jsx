import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { LogicalSize, LogicalPosition } from "@tauri-apps/api/dpi";
import { GripVertical, Mic, MicOff, EyeOff, Home, ChevronRight, ChevronLeft } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import "./overlay.css";

function Overlay() {
    const [meetingState, setMeetingState] = useState({
        in_meeting: false,
        meeting_title: null
    });
    const [isVisible, setIsVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pillRef = useRef(null);

    useEffect(() => {
        const handleVisibilityChange = async (shouldShow) => {
            const appWindow = getCurrentWindow();
            if (shouldShow) {
                setIsVisible(true);
                await appWindow.show();
            } else {
                setIsVisible(false);
                await appWindow.hide();
            }
        };

        const checkInitialState = async () => {
            try {
                const initialState = await invoke("get_meeting_state");
                setMeetingState(initialState);
                handleVisibilityChange(initialState.in_meeting);
            } catch (e) {
                console.error("Failed to get initial meeting state:", e);
            }
        };

        checkInitialState();

        const unlistenPromise = listen("meeting-state", (e) => {
            const newState = e.payload;
            setMeetingState(newState);
            handleVisibilityChange(newState.in_meeting);
        });

        return () => {
            unlistenPromise.then((u) => u());
        };
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        const appWindow = getCurrentWindow();
        const el = pillRef.current;
        if (!el) return;

        let monitorLogicalWidth = Infinity;
        let monitorLogicalHeight = Infinity;

        const initMonitor = async () => {
            try {
                const scale = await appWindow.scaleFactor();
                const mon = await appWindow.currentMonitor();
                if (mon && mon.size) {
                    monitorLogicalWidth = Math.floor(mon.size.width / scale);
                    monitorLogicalHeight = Math.floor(mon.size.height / scale);
                }
            } catch (_) {
                // ignore, fallback keeps current position
            }
        };

        const resizeAndKeepOnScreen = async () => {
            const r = el.getBoundingClientRect();
            const width = Math.ceil(r.width);
            const height = Math.ceil(r.height);
            await appWindow.setSize(new LogicalSize(width, height));

            try {
                const scale = await appWindow.scaleFactor();
                const outer = await appWindow.outerPosition();
                let x = Math.floor(outer.x / scale);
                let y = Math.floor(outer.y / scale);

                if (isFinite(monitorLogicalWidth) && isFinite(monitorLogicalHeight)) {
                    const maxX = Math.max(0, monitorLogicalWidth - width);
                    const maxY = Math.max(0, monitorLogicalHeight - height);
                    if (x > maxX) x = maxX;
                    if (y > maxY) y = maxY;
                    if (x < 0) x = 0;
                    if (y < 0) y = 0;
                    await appWindow.setPosition(new LogicalPosition(x, y));
                }
            } catch (_) {
                // best-effort
            }
        };

        initMonitor().then(resizeAndKeepOnScreen);

        const ro = new ResizeObserver(() => {
            resizeAndKeepOnScreen();
        });
        ro.observe(el);

        return () => ro.disconnect();
    }, [isVisible]);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    const hideOverlay = async () => {
        const appWindow = getCurrentWindow();
        setIsVisible(false);
        await appWindow.hide();
    };

    return (
        <div
            id="toolbar"
            ref={pillRef}
            className={`toolbar ${isExpanded ? "expanded" : ""}`}
        >
            {/* Drag handle */}
            <div className="drag-handle" data-tauri-drag-region aria-label="Drag">
                <GripVertical size={16} />
            </div>

            {!isExpanded ? (
                <>
                    {/* Recording indicator (green when recording, red when idle) */}
                    <span
                        className={`status-indicator ${isRecording ? "active" : ""}`}
                        aria-label={isRecording ? "Recording" : "Idle"}
                    />

                    {/* Record toggle */}
                    <button
                        className={`icon-btn ${isRecording ? "ok" : "warn"}`}
                        title={isRecording ? "Stop recording" : "Start recording"}
                        onClick={() => setIsRecording((v) => !v)}
                    >
                        {isRecording ? <Mic size={16} /> : <MicOff size={16} />}
                    </button>

                    {/* Hide overlay */}
                    <button className="icon-btn" title="Hide overlay" onClick={hideOverlay}>
                        <EyeOff size={16} />
                    </button>

                    {/* Home placeholder menu */}
                    <div className="menu-wrapper">
                        <button
                            className="icon-btn"
                            title="Home"
                            aria-haspopup="menu"
                            aria-expanded={isMenuOpen}
                            onClick={() => setIsMenuOpen((o) => !o)}
                        >
                            <Home size={16} />
                        </button>
                        {isMenuOpen && (
                            <div className="menu" role="menu">
                                <button className="menu-item" role="menuitem" onClick={() => alert("Open home (placeholder)")}>Open Home</button>
                                <button className="menu-item" role="menuitem" onClick={() => alert("Settings (placeholder)")}>Settings</button>
                                <button className="menu-item" role="menuitem" onClick={() => setIsMenuOpen(false)}>Close</button>
                            </div>
                        )}
                    </div>

                    {/* Expand button */}
                    <button className="icon-btn" title="Expand" onClick={toggleExpanded}>
                        <ChevronRight size={16} />
                    </button>
                </>
            ) : (
                <>
                    {/* Recording with label */}
                    <button
                        className={`btn primary ${isRecording ? "ok" : "warn"}`}
                        title={isRecording ? "Stop recording" : "Start recording"}
                        onClick={() => setIsRecording((v) => !v)}
                    >
                        {isRecording ? <Mic size={16} /> : <MicOff size={16} />}
                        <span style={{ marginLeft: 6 }}>{isRecording ? "Stop" : "Listen"}</span>
                    </button>

                    {/* Hide with label */}
                    <button className="btn" onClick={hideOverlay}>
                        <EyeOff size={16} />
                        <span style={{ marginLeft: 6 }}>Hide</span>
                    </button>

                    {/* Home with menu */}
                    <div className="menu-wrapper">
                        <button className="btn" onClick={() => setIsMenuOpen((o) => !o)}>
                            <Home size={16} />
                            <span style={{ marginLeft: 6 }}>Home</span>
                        </button>
                        {isMenuOpen && (
                            <div className="menu" role="menu">
                                <button className="menu-item" role="menuitem" onClick={() => alert("Open home (placeholder)")}>Open Home</button>
                                <button className="menu-item" role="menuitem" onClick={() => alert("Settings (placeholder)")}>Settings</button>
                                <button className="menu-item" role="menuitem" onClick={() => setIsMenuOpen(false)}>Close</button>
                            </div>
                        )}
                    </div>

                    {/* Collapse */}
                    <button className="icon-btn" title="Collapse" onClick={toggleExpanded}>
                        <ChevronLeft size={16} />
                    </button>
                </>
            )}
        </div>
    );
}

const root = createRoot(document.getElementById("root"));
root.render(<Overlay />);
