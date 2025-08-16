import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import { useState } from 'react';

export default function Recorder() {
    const [isRecording, setIsRecording] = useState(false);
    const [recordedURL, setRecordedURL] = useState('');

    const startRecording = async () => {
        const path = await invoke('start_recording');
        setRecordedURL(path);
        setIsRecording(true);
    };

    const stopRecording = async () => {
        await invoke('stop_recording');
        setIsRecording(false);
    };

    return (
        <div>
            <button onClick={isRecording ? stopRecording : startRecording}>
                {isRecording ? 'Stop' : 'Record'}
            </button>

            {recordedURL && <audio controls src={convertFileSrc(recordedURL)} />}
        </div>
    );
}
