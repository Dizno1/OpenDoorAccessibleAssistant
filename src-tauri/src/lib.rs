use base64::Engine;
use serde::Serialize;
use std::{fs, path::PathBuf, process::Command, time::{SystemTime, UNIX_EPOCH}};
use tauri::Manager;

#[derive(Serialize)]
struct EngineStatus { ready: bool, details: String }

fn engine_path(app: &tauri::AppHandle, name: &str) -> Result<PathBuf, String> {
    let path = app.path().resource_dir().map_err(|e| e.to_string())?.join("resources").join("engines").join(name);
    if !path.is_file() { return Err(format!("Bundled processing component is missing: {}", name)); }
    Ok(path)
}

#[tauri::command]
fn transcription_engine_status(app: tauri::AppHandle) -> EngineStatus {
    let required = ["ffmpeg.exe", "ffprobe.exe", "whisper-cli.exe", "ggml-base.en.bin"];
    let missing: Vec<_> = required.iter().filter(|name| engine_path(&app, name).is_err()).copied().collect();
    if missing.is_empty() { EngineStatus { ready: true, details: "Local transcription tools and English speech model are installed.".into() } }
    else { EngineStatus { ready: false, details: format!("Missing bundled components: {}. Rebuild the installer using the Windows workflow.", missing.join(", ")) } }
}

#[tauri::command]
async fn transcribe_local(app: tauri::AppHandle, file_name: String, file_base64: String) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let ffmpeg = engine_path(&app, "ffmpeg.exe")?;
        let whisper = engine_path(&app, "whisper-cli.exe")?;
        let model = engine_path(&app, "ggml-base.en.bin")?;
        let base = std::env::temp_dir().join(format!("odaa-transcribe-{}-{}", std::process::id(), SystemTime::now().duration_since(UNIX_EPOCH).map_err(|e| e.to_string())?.as_nanos()));
        fs::create_dir_all(&base).map_err(|e| e.to_string())?;
        let result = (|| {
            let extension = std::path::Path::new(&file_name).extension().and_then(|e| e.to_str()).unwrap_or("media");
            if !extension.chars().all(|c| c.is_ascii_alphanumeric()) { return Err("Invalid media file extension".into()); }
            let input = base.join(format!("input.{}", extension));
            let audio = base.join("audio.wav");
            let output_prefix = base.join("transcript");
            let bytes = base64::engine::general_purpose::STANDARD.decode(file_base64).map_err(|e| e.to_string())?;
            fs::write(&input, bytes).map_err(|e| e.to_string())?;
            let conversion = Command::new(ffmpeg).args(["-nostdin", "-y", "-i"]).arg(&input).args(["-vn", "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le"]).arg(&audio).output().map_err(|e| e.to_string())?;
            if !conversion.status.success() { return Err(format!("Audio extraction failed: {}", String::from_utf8_lossy(&conversion.stderr).chars().take(700).collect::<String>())); }
            let recognition = Command::new(whisper).arg("-m").arg(model).arg("-f").arg(&audio).arg("-osrt").arg("-of").arg(&output_prefix).arg("-nt").output().map_err(|e| e.to_string())?;
            if !recognition.status.success() { return Err(format!("Local speech recognition failed: {}", String::from_utf8_lossy(&recognition.stderr).chars().take(700).collect::<String>())); }
            let srt = fs::read_to_string(output_prefix.with_extension("srt")).map_err(|e| format!("Transcription completed without an SRT file: {}", e))?;
            if srt.trim().is_empty() { return Err("Speech recognition returned no spoken content.".into()); }
            Ok(srt)
        })();
        let _ = fs::remove_dir_all(&base);
        result
    }).await.map_err(|e| e.to_string())?
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![transcription_engine_status, transcribe_local])
        .run(tauri::generate_context!())
        .expect("Unable to start Open Door Accessible Assistant");
}
