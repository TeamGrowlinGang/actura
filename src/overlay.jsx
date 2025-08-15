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
            <p>{zoomOpen ? "Zoom is open" : "Zoom is closed"}</p>
            <button>Start Recording</button>
        </div>
    );
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<Overlay />);