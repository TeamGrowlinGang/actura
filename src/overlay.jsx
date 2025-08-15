import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { listen } from "@tauri-apps/api/event";
import "./overlay.css";

function Overlay() {
    const [zoomOpen, setZoomOpen] = useState(false);

    useEffect(() => {
        const unlistenPromise = listen("zoom-status", (event) => {
            setZoomOpen(event.payload);
        });
        return () => { unlistenPromise.then(unlisten => unlisten()); };
    }, []);

    return (
        <div className="overlay">
            <button className="primary">Listen</button>
            <button>Ask question</button>
            <button>Hide</button>
            <button className="icon-btn">🏠</button>
        </div>

    );
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<Overlay />);