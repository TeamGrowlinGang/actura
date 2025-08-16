import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { LogicalSize, LogicalPosition } from "@tauri-apps/api/dpi";
import { GripVertical, Home, Grip } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { supabase } from "./lib/supabaseClient";
import "./overlay.css";

function Overlay() {
    const [meetingState, setMeetingState] = useState({
        in_meeting: false,
        meeting_title: null
    });
    const [isVisible, setIsVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [autoResize, setAutoResize] = useState(true);
    const [elapsedMs, setElapsedMs] = useState(0);
    const mediaRecorderRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const micStreamRef = useRef(null);
    const screenStreamRef = useRef(null);
    const audioContextRef = useRef(null);
    const dataChunksRef = useRef([]);
    const [recordings, setRecordings] = useState([]);
    const [lastSavedPath, setLastSavedPath] = useState("");
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
        if (!isVisible || !autoResize) return;

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
    }, [isVisible, autoResize]);

    const hideOverlay = async () => {
        const appWindow = getCurrentWindow();
        setIsVisible(false);
        await appWindow.hide();
    };

    const getSupportedMimeType = () => {
        const preferred = [
            "audio/webm;codecs=opus",
            "audio/webm",
            "audio/ogg;codecs=opus",
            "audio/ogg"
        ];
        for (const type of preferred) {
            if (window.MediaRecorder && MediaRecorder.isTypeSupported(type)) return type;
        }
        return undefined;
    };

    const generateRecordingName = () => {
        const uuid = (globalThis.crypto && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).slice(2);
        const ts = Date.now();
        return `${uuid}_${ts}.webm`;
    };

    useEffect(() => {
        let interval;
        if (isRecording) {
            const start = Date.now() - elapsedMs;
            interval = setInterval(() => setElapsedMs(Date.now() - start), 500);
        }
        return () => interval && clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRecording]);

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    const startRecording = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
        try {
            // Expand overlay window to avoid permission UI clipping
            try {
                setAutoResize(false);
                await invoke("expand_overlay");
            } catch (_) { }

            // Microphone
            const micStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                }
            });
            micStreamRef.current = micStream;

            // System audio via display capture (user must choose a source and share audio)
            let systemStream = null;
            try {
                systemStream = await navigator.mediaDevices.getDisplayMedia({
                    audio: true,
                    video: true
                });
            } catch (err) {
                console.warn("System audio not available or denied. Proceeding with mic only.", err);
            }
            screenStreamRef.current = systemStream;

            // Mix mic + system using WebAudio
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioCtx();
            audioContextRef.current = ctx;
            await ctx.resume().catch(() => { });

            const destination = ctx.createMediaStreamDestination();

            const micSource = ctx.createMediaStreamSource(micStream);
            micSource.connect(destination);

            if (systemStream && systemStream.getAudioTracks().length > 0) {
                const sysAudio = new MediaStream(systemStream.getAudioTracks());
                const sysSource = ctx.createMediaStreamSource(sysAudio);
                sysSource.connect(destination);
            }

            const mixedStream = destination.stream;
            mediaStreamRef.current = mixedStream;

            const mimeType = getSupportedMimeType();
            const mr = new MediaRecorder(mixedStream, mimeType ? { mimeType } : undefined);
            dataChunksRef.current = [];
            mr.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) dataChunksRef.current.push(e.data);
            };
            mr.onstop = () => {
                try {
                    const type = mimeType || "audio/webm";
                    const blob = new Blob(dataChunksRef.current, { type });
                    const name = generateRecordingName();
                    setRecordings((prev) => [{ name, blob }, ...prev]);
                    (async () => {
                        try {
                            const path = `audio/${name}`;
                            const { error } = await supabase.storage
                                .from("recordings")
                                .upload(path, blob, { contentType: type, upsert: false });
                            if (error) throw error;
                            const { data: pub } = supabase.storage
                                .from("recordings")
                                .getPublicUrl(path);
                            const url = pub?.publicUrl || path;
                            setLastSavedPath(url);
                            console.log("Uploaded recording to Supabase:", url);
                        } catch (e) {
                            console.error("Failed to upload recording to Supabase:", e);
                        }
                    })();
                } finally {
                    dataChunksRef.current = [];
                    if (mediaStreamRef.current) {
                        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
                        mediaStreamRef.current = null;
                    }
                    if (micStreamRef.current) {
                        micStreamRef.current.getTracks().forEach((t) => t.stop());
                        micStreamRef.current = null;
                    }
                    if (screenStreamRef.current) {
                        screenStreamRef.current.getTracks().forEach((t) => t.stop());
                        screenStreamRef.current = null;
                    }
                    if (audioContextRef.current) {
                        try { audioContextRef.current.close(); } catch (_) { }
                        audioContextRef.current = null;
                    }
                    mediaRecorderRef.current = null;
                    // Restore compact overlay size after recording completes
                    (async () => { try { await invoke("restore_overlay"); } catch (_) { } })();
                }
            };
            mediaRecorderRef.current = mr;
            mr.start();
            setElapsedMs(0);
            setIsRecording(true);
            // Permissions acquired; restore compact size and re-enable auto-resize
            try { await invoke("restore_overlay"); } catch (_) { }
            setAutoResize(true);
        } catch (e) {
            console.error(e);
            // On failure, ensure overlay is restored
            try { await invoke("restore_overlay"); } catch (_) { }
            setAutoResize(true);
        }
    };

    const stopRecording = () => {
        try {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.stop();
            }
        } finally {
            setIsRecording(false);
        }
    };

    const onRecordPress = () => (isRecording ? stopRecording() : startRecording());

    const goHome = async () => {
        try {
            await invoke("open_home");
        } catch (e) {
            console.error("Failed to open home URL:", e);
        }
    };

    return (
        <div
            id="toolbar"
            ref={pillRef}
            className={`toolbar ${isExpanded ? "expanded" : ""}`}
        >
            {/* Non-interactive background to isolate backdrop-filter from drag region */}
            <div className="toolbar-bg" aria-hidden="true" />
            <div
                className="toolbar-content"
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => { if (!isDragging) setIsExpanded(false); }}
            >
                {/* Collapsed / Base content: record + timer block */}
                <div className={`recorder-pill ${isExpanded ? "expanded" : ""}`}>
                    <button
                        className={`record-toggle ${isRecording ? "recording" : "idle"}`}
                        onClick={onRecordPress}
                        aria-label={isRecording ? "Stop recording" : "Start recording"}
                    >
                        <span className="record-toggle-inner" />
                    </button>
                    <span className="timer-text">{formatTime(isRecording ? elapsedMs : 0)}</span>
                </div>

                {/* Expanded-only actions (always present for animation) */}
                <div className={`expanded-actions ${(isExpanded || isRecording) ? "show" : ""}`}>
                    <button className="icon-btn lg" title="Home" onClick={goHome}>
                        <Home size={18} />
                    </button>
                    {/* Drag handle */}
                    <div
                        className="drag-handle"
                        data-tauri-drag-region
                        aria-label="Drag"
                        onMouseDown={() => {
                            setIsDragging(true);
                            setIsExpanded(true);
                            const onUp = () => {
                                setIsDragging(false);
                                window.removeEventListener("mouseup", onUp);
                            };
                            window.addEventListener("mouseup", onUp);
                        }}
                    >
                        <GripVertical size={16} />
                    </div>
                </div>
            </div>
        </div>
    );
}

const root = createRoot(document.getElementById("root"));
root.render(<Overlay />);
