import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { LogicalSize } from "@tauri-apps/api/dpi";
import "./overlay.css";

function Overlay() {
    const [zoomOpen, setZoomOpen] = useState(false);
    const pillRef = useRef(null);

    // 1) Receive status from Rust thread
    useEffect(() => {
        const unlistenPromise = listen("zoom-status", (e) => {
            setZoomOpen(Boolean(e.payload));
        });
        return () => { unlistenPromise.then((u) => u()); };
    }, []);

    // 2) Auto-size the window to the pill's exact bounding box
    useEffect(() => {
        const appWindow = getCurrentWindow();
        const el = pillRef.current;
        if (!el) return;

        const resize = () => {
            const r = el.getBoundingClientRect();
            // +0.5 for fractional text metrics, then ceil for crisp edges
            const w = Math.ceil(r.width + 0.5);
            const h = Math.ceil(r.height + 0.5);
            appWindow.setSize(new LogicalSize(w, h));
        };

        // Initial and on any layout change
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(el);

        return () => ro.disconnect();
    }, []);

    return (
        <div
            id="toolbar"
            ref={pillRef}
            className="toolbar"
            data-tauri-drag-region
        // No extra wrappers! The pill is the root element.
        >
            <button className="btn primary">Listen</button>
            <button className="btn">Ask question</button>
            <button className="btn">Hide</button>
            <button className="icon-btn" title="Home">🏠</button>
        </div>
    );
}

const root = createRoot(document.getElementById("root"));
root.render(<Overlay />);
