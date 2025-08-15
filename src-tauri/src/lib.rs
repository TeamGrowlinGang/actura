// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use sysinfo::System;
use tauri::Emitter;
use tauri::Manager;

#[tauri::command]
fn is_zoom_running() -> bool {
    let mut sys = System::new_all();
    sys.refresh_all();

    sys.processes().values().any(|p| {
        p.name()
            .to_string_lossy() // convert OsString to String
            .to_ascii_lowercase() // lowercase
            .contains("zoom") // check if it contains "zoom"
    })
}

#[tauri::command]
fn check_zoom(app_handle: tauri::AppHandle) {
    let zoom_running = is_zoom_running(); // call your existing function

    // send event to overlay window
    if let Some(overlay) = app_handle.get_webview_window("overlay") {
        overlay.emit("zoom-status", zoom_running).unwrap();
    }
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let handle = app.handle(); // get AppHandle from App

            // Show overlay window if it exists
            if let Some(overlay) = handle.get_webview_window("overlay") {
                overlay.show().unwrap();
            }

            // Spawn background thread to continuously check Zoom status
            let bg_handle = handle.clone();
            std::thread::spawn(move || loop {
                crate::check_zoom(bg_handle.clone());
                std::thread::sleep(std::time::Duration::from_secs(2));
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, is_zoom_running, check_zoom])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
