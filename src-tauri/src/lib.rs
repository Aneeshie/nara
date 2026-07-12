use tauri::{Manager, State};

use std::sync::Mutex;

use crate::terminal::manager::TerminalManager;

pub mod terminal;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn create_terminal(
    title: String,
    manager: State<'_, Mutex<TerminalManager>>
) -> Result<u32, String>{
    let mut manager = manager.lock().unwrap();

    let id = manager
        .create_session(title)
        .map_err(|e| e.to_string())?;

    manager
        .write_to_session(id, "pwd\n".to_string())
        .map_err(|e| e.to_string())?;

    Ok(id)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            app.manage(Mutex::new(TerminalManager::new()));

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![create_terminal])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
