use tauri::{AppHandle, Manager, State};

use std::sync::Mutex;

use crate::terminal::manager::TerminalManager;

pub mod terminal;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn create_terminal(
    title: String,
    app_handle: AppHandle,
    manager: State<'_, Mutex<TerminalManager>>,
) -> Result<u32, String> {
    let mut manager = manager.lock().unwrap();

    let id = manager
        .create_session(title, app_handle)
        .map_err(|e| e.to_string())?;

    Ok(id)
}

#[tauri::command]
fn write_to_terminal(
    id: u32,
    input: String,
    manager: State<'_, Mutex<TerminalManager>>,
) -> Result<(), String> {
    let mut manager = manager.lock().unwrap();

    manager
        .write_to_session(id, input)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn resize_terminal(
    id: u32,
    rows: u16,
    cols: u16,
    manager: State<'_, Mutex<TerminalManager>>,
) -> Result<(), String> {
    let mut manager = manager.lock().unwrap();

    manager
        .resize_session(id, rows, cols)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn kill_terminal(id: u32, manager: State<'_, Mutex<TerminalManager>>) -> Result<(), String> {
    let mut manager = manager.lock().unwrap();

    manager.kill_session(id).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            app.manage(Mutex::new(TerminalManager::new()));

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            create_terminal,
            write_to_terminal,
            resize_terminal,
            kill_terminal
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
