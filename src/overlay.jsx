import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { LogicalSize, LogicalPosition } from "@tauri-apps/api/dpi";
import { invoke } from "@tauri-apps/api/core";
import "./overlay.css";

function Overlay() {
    const [meetingState, setMeetingState] = useState({
        in_meeting: false,
        meeting_title: null
    });
    const [isVisible, setIsVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
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
            data-tauri-drag-region
        >
            {!isExpanded ? (
                <>
                    <div className="status-indicator">
                        {meetingState.in_meeting ? "🟢" : "🔴"}
                    </div>
                    <span className="meeting-status">
                        {meetingState.in_meeting ? "In Meeting" : "No Meeting"}
                    </span>
                    <button className="icon-btn" title="Expand" onClick={toggleExpanded}>
                        ⚡
                    </button>
                </>
            ) : (
                <>
                    <div className="status-indicator">
                        {meetingState.in_meeting ? "🟢" : "🔴"}
                    </div>
                    <div className="meeting-info">
                        <span className="meeting-status">
                            {meetingState.meeting_title || "Meeting Active"}
                        </span>
                    </div>
                    <button className="btn primary">Listen</button>
                    <button className="btn">Ask Question</button>
                    <button className="btn" onClick={hideOverlay}>
                        Hide
                    </button>
                    <button className="icon-btn" title="Collapse" onClick={toggleExpanded}>
                        ◀
                    </button>
                </>
            )}
        </div>
    );
}

const root = createRoot(document.getElementById("root"));
root.render(<Overlay />);
