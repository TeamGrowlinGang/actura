import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import Recorder from "./components/recorder";
import "./App.css";

function App() {
    const [greetMsg, setGreetMsg] = useState("");
    const [name, setName] = useState("");
    const [meetingState, setMeetingState] = useState({
        in_meeting: false,
        meeting_title: null
    });

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const state = await invoke("get_meeting_state");
                setMeetingState(state);
            } catch (e) {
                console.error(e);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    async function greet() {
        setGreetMsg(await invoke("greet", { name }));
    }

    return (
        <main className="container">
            <h1 className="
                            text-6xl 
                            font-extrabold 
                            text-transparent 
                            bg-clip-text 
                            bg-gradient-to-r 
                            from-pink-500 
                            via-yellow-400 
                            to-green-500 
                            animate-pulse 
                            drop-shadow-[0_0_10px_rgba(255,255,255,0.7)] 
                            transform 
                            hover:scale-110 
                            hover:rotate-3 
                            transition-all 
                            duration-500
                ">
                Welcome to Tauri + React
            </h1>
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

            <p>
                Meeting: {meetingState.in_meeting ? "Active" : "Not Active"}
                {meetingState.meeting_title && <span> - {meetingState.meeting_title}</span>}
            </p>

            <Recorder />

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
