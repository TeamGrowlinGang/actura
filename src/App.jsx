import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
    const [greetMsg, setGreetMsg] = useState("");
    const [name, setName] = useState("");
    const [zoomOpen, setZoomOpen] = useState(false);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const running = await invoke("is_zoom_running");
                setZoomOpen(running);
            } catch (e) {
                console.error(e);
            }
        }, 2000); // check every 2 seconds

        return () => clearInterval(interval);
    }, []);

    async function greet() {
        setGreetMsg(await invoke("greet", { name }));
    }

    return (
        <main className="container">
            <h1>Welcome to Tauri + React</h1>

            <div className="row">
                <a href="https://vite.dev" target="_blank">
                    <img src="/vite.svg" className="logo vite" alt="Vite logo" />
                </a>
                <a href="https://tauri.app" target="_blank">
                    <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>
            <p>Click on the Tauri, Vite, and React logos to learn more.</p>
            <p>{zoomOpen ? "Zoom is open" : "Zoom is closed"}</p>

            <form
                className="row"
                onSubmit={(e) => {
                    e.preventDefault();
                    greet();
                }}
            >
                <input
                    id="greet-input"
                    onChange={(e) => setName(e.currentTarget.value)}
                    placeholder="Enter a name..."
                />
                <button type="submit">Greet</button>
            </form>
            <p>{greetMsg}</p>
        </main>
    );
}

export default App;
