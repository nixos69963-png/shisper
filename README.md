# Whisper Flow

Local push-to-talk speech-to-text. A tiny floating pill (Vite + React + Tauri) on top of the Python/FastAPI Whisper backend.
Press **Alt+P** anywhere, speak, press **Alt+P** again — text is pasted where your cursor is.

## Structure
- `src/` — React UI (the pill)
- `src-tauri/` — Tauri desktop shell; registers the global **Alt+P** shortcut
- `backend/` — FastAPI + faster-whisper (unchanged logic)
- `.github/workflows/build.yml` — builds Linux / Windows / macOS installers on every push to `main` (tag `v*` for a draft release)

## Run
```bash
# 1. backend
cd backend && ./install.sh && . .venv/bin/activate && python server.py
# 2. desktop app (new terminal)
npm install
npx tauri icon app-icon.png   # once
npm run tauri dev
```

## Push to a new GitHub repo
```bash
git init && git add . && git commit -m "Whisper Flow: Vite + React + Tauri"
git branch -M main
git remote add origin https://github.com/<you>/whisper-flow.git
git push -u origin main
```
Actions then builds the installers (Actions tab → artifacts).
Release: `git tag v0.2.0 && git push --tags`.

## Notes
- Alt+P is handled by Tauri. To use the old Python hotkey instead: `WHISPER_FLOW_PYNPUT_HOTKEY=1 python server.py`.
- Linux paste needs X11 (`xclip`, `xdotool`).
