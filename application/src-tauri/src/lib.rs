// lib.rs

use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::{SystemTime, UNIX_EPOCH};

use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use hound;
#[cfg(desktop)]
use tauri::tray::{TrayIconBuilder, TrayIconEvent};
use tauri::{Emitter, Manager};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};
use tauri_plugin_opener::OpenerExt;

use tauri::Window;

fn resize_overlay(window: Window) {
    window
        .set_size(tauri::Size::Logical(tauri::LogicalSize {
            width: 900.0,
            height: 600.0,
        }))
        .unwrap();
}

fn desktop_actura_dir() -> std::path::PathBuf {
    use std::path::PathBuf;
    let base = std::env::var_os("HOME")
        .or_else(|| std::env::var_os("USERPROFILE"))
        .map(PathBuf::from)
        .map(|h| h.join("Desktop").join("Actura"))
        .unwrap_or_else(|| std::env::temp_dir().join("Actura"));
    let _ = std::fs::create_dir_all(&base);
    base
}

#[tauri::command]
fn save_web_audio(bytes: Vec<u8>, filename: Option<String>) -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let dir = desktop_actura_dir();
    let name = filename.unwrap_or_else(|| {
        let ts = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis();
        format!("recording_{}.webm", ts)
    });
    let path = dir.join(name);
    // Best-effort write; bubble errors via panic to surface during dev
    std::fs::write(&path, bytes).expect("failed to write webm to disk");
    path.to_string_lossy().to_string()
}

#[derive(Debug, Clone, serde::Serialize)]
struct MeetingState {
    in_meeting: bool,
    meeting_title: Option<String>,
}

type SharedMeetingState = Arc<Mutex<MeetingState>>;
type RecorderActive = Arc<AtomicBool>; // For audio recording control

// ------------------- Overlay resize commands -------------------
#[tauri::command]
fn expand_overlay(window: Window) {
    resize_overlay(window);
}

#[tauri::command]
fn restore_overlay(window: Window) {
    let _ = window.set_size(tauri::Size::Logical(tauri::LogicalSize {
        width: 170.0,
        height: 50.0,
    }));
}

// ------------------- Meeting state commands -------------------
#[tauri::command]
fn get_meeting_state(state: tauri::State<SharedMeetingState>) -> MeetingState {
    state.lock().unwrap().clone()
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// ------------------- External open commands -------------------
#[tauri::command]
fn open_home(app: tauri::AppHandle) -> Result<(), String> {
    app.opener()
        .open_url("https://www.google.com", None::<String>)
        .map_err(|e| e.to_string())
}

// ------------------- Audio recording commands -------------------
#[tauri::command]
fn start_recording(recorder_active: tauri::State<RecorderActive>) -> String {
    let active = recorder_active.inner().clone();
    active.store(true, Ordering::SeqCst);

    // Prefer saving to Desktop/Actura. Fallback to temp dir if not available.
    let base_dir = desktop_actura_dir();
    let ts = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis();
    let output_path = base_dir.join(format!("recording_{}.wav", ts));
    let output_path_for_thread = output_path.clone();
    let output_path_str = output_path.to_string_lossy().to_string();

    thread::spawn(move || {
        let host = cpal::default_host();
        let device = host.default_input_device().expect("No input device found");
        let config = device.default_input_config().unwrap();

        let spec = hound::WavSpec {
            channels: config.channels() as u16,
            sample_rate: config.sample_rate().0,
            bits_per_sample: 16,
            sample_format: hound::SampleFormat::Int,
        };

        // Keep the writer accessible from both the callback and the outer thread.
        // Wrap in Arc<Mutex<Option<...>>> so we can take ownership to finalize later.
        let writer_arc = Arc::new(Mutex::new(Some(
            hound::WavWriter::create(output_path_for_thread, spec).unwrap(),
        )));
        let writer_for_cb = Arc::clone(&writer_arc);

        let err_fn = |err| eprintln!("an error occurred on stream: {}", err);

        let stream = device
            .build_input_stream(
                &config.into(),
                move |data: &[f32], _: &cpal::InputCallbackInfo| {
                    if let Ok(mut guard) = writer_for_cb.lock() {
                        if let Some(ref mut w) = *guard {
                            for &sample in data {
                                let sample_i16 = (sample * i16::MAX as f32) as i16;
                                w.write_sample(sample_i16).unwrap();
                            }
                        }
                    }
                },
                err_fn,
            )
            .unwrap();

        stream.play().unwrap();

        // Keep recording until stop is called
        while active.load(Ordering::SeqCst) {
            std::thread::sleep(std::time::Duration::from_millis(100));
        }

        // Stop audio stream before finalizing file to avoid concurrent writes
        drop(stream);

        // Take ownership of the writer and finalize the WAV file in a scoped block
        {
            let mut guard = writer_arc.lock().unwrap();
            if let Some(w) = guard.take() {
                w.finalize().unwrap();
            }
        }
    });

    output_path_str
}

#[tauri::command]
fn stop_recording(recorder_active: tauri::State<RecorderActive>) {
    recorder_active.inner().store(false, Ordering::SeqCst);
}

// ------------------- Main run function -------------------
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let recorder_active: RecorderActive = Arc::new(AtomicBool::new(false));

    tauri::Builder::default()
        // Opener plugin for opening external URLs
        .plugin(tauri_plugin_opener::init())
        // ------------------- Global shortcut plugin -------------------
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, shortcut, event| {
                    if event.state == ShortcutState::Pressed
                        && shortcut.matches(Modifiers::CONTROL, Code::KeyM)
                    {
                        let state = app.state::<SharedMeetingState>();
                        let mut guard = state.lock().unwrap();
                        guard.in_meeting = !guard.in_meeting;
                        guard.meeting_title = guard.in_meeting.then(|| "Manual Meeting".into());

                        if let Some(overlay) = app.get_webview_window("overlay") {
                            let _ = overlay.emit("meeting-state", &*guard);
                            if guard.in_meeting {
                                let _ = overlay.show();
                            } else {
                                let _ = overlay.hide();
                            }
                        }
                        println!("Meeting toggled: {:?}", &*guard);
                    }
                })
                .build(),
        )
        // ------------------- Shared states -------------------
        .manage(Arc::new(Mutex::new(MeetingState {
            in_meeting: true,
            meeting_title: Some("Ready".into()),
        })))
        .manage(recorder_active.clone()) // <- Recorder state
        // ------------------- Setup -------------------
        .setup(|app| {
            // Build a tray icon that toggles overlay visibility on click
            #[cfg(desktop)]
            {
                use std::sync::Mutex as StdMutex;
                use std::time::{Duration, Instant};

                let last_click = Arc::new(StdMutex::new(Instant::now() - Duration::from_secs(1)));
                let last_click_closure = last_click.clone();

                let mut tray_builder = TrayIconBuilder::new().tooltip("Actura").on_tray_icon_event(
                    move |tray, event| match event {
                        TrayIconEvent::Click { .. } => {
                            // Debounce to avoid double toggle on some platforms
                            let now = Instant::now();
                            if let Ok(mut prev) = last_click_closure.lock() {
                                if now.duration_since(*prev) < Duration::from_millis(300) {
                                    return;
                                }
                                *prev = now;
                            }

                            let app = tray.app_handle();
                            let state = app.state::<SharedMeetingState>();
                            let mut guard = state.lock().unwrap();
                            guard.in_meeting = !guard.in_meeting;
                            if let Some(overlay) = app.get_webview_window("overlay") {
                                let _ = overlay.emit("meeting-state", &*guard);
                                if guard.in_meeting {
                                    let _ = overlay.show();
                                    let _ = overlay.set_focus();
                                } else {
                                    let _ = overlay.hide();
                                }
                            }
                        }
                        _ => {}
                    },
                );

                if let Some(icon) = app.default_window_icon() {
                    tray_builder = tray_builder.icon(icon.clone());
                }

                let _tray = tray_builder.build(app)?;
            }

            // Register the global shortcut Ctrl+M to toggle overlay visibility
            let gs = app.global_shortcut();
            if let Err(e) = gs.register(Shortcut::new(Some(Modifiers::CONTROL), Code::KeyM)) {
                println!("Failed to register Ctrl+M shortcut: {}", e);
            } else {
                println!("Registered global shortcut: Ctrl+M");
            }
            // Ensure overlay reflects initial state, don't force visible
            if let Some(overlay) = app.handle().get_webview_window("overlay") {
                let state = app.state::<SharedMeetingState>();
                let guard = state.lock().unwrap();
                let _ = overlay.emit("meeting-state", &*guard);
            }
            Ok(())
        })
        // ------------------- Commands -------------------
        .invoke_handler(tauri::generate_handler![
            greet,
            get_meeting_state,
            start_recording,
            stop_recording,
            save_web_audio,
            expand_overlay,
            restore_overlay,
            open_home
        ])
        .run(tauri::generate_context!())
        .expect("Error running tauri application");
}
