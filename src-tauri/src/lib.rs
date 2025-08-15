// Learn more at https://tauri.app/develop/calling-rust/

use std::sync::{Arc, Mutex};
use tauri::{Emitter, Manager};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

#[derive(Debug, Clone, serde::Serialize)]
struct MeetingState {
    in_meeting: bool,
    meeting_title: Option<String>,
}

type SharedMeetingState = Arc<Mutex<MeetingState>>;

#[tauri::command]
fn get_meeting_state(state: tauri::State<SharedMeetingState>) -> MeetingState {
    state.lock().unwrap().clone()
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
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
        .manage(Arc::new(Mutex::new(MeetingState {
            in_meeting: false,
            meeting_title: None,
        })))
        .setup(|app| {
            if let Some(overlay) = app.handle().get_webview_window("overlay") {
                let _ = overlay.hide();
            }

            // Register the global shortcut Ctrl+M to toggle overlay visibility
            let gs = app.global_shortcut();
            // Best-effort register; logs are enough for debugging failures
            if let Err(e) = gs.register(Shortcut::new(Some(Modifiers::CONTROL), Code::KeyM)) {
                println!("Failed to register Ctrl+M shortcut: {}", e);
            } else {
                println!("Registered global shortcut: Ctrl+M");
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, get_meeting_state])
        .run(tauri::generate_context!())
        .expect("Error running tauri application");
}
