import { useCallback, useEffect, useRef, useState } from "react";
import { getStatus, toggle } from "./api";

const isTauri = "__TAURI_INTERNALS__" in window;

export default function App() {
  const [recording, setRecording] = useState(false);
  const [online, setOnline] = useState(false);
  const [msg, setMsg] = useState("Alt+P to talk");
  const busy = useRef(false);

  const flip = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const r = await toggle();
      setRecording(r.recording);
    } catch {
      setOnline(false);
    } finally {
      busy.current = false;
    }
  }, []);

  // Poll backend status
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const s = await getStatus();
        if (!alive) return;
        setOnline(true);
        setRecording(s.recording);
        if (s.messages.length) setMsg(s.messages[s.messages.length - 1]);
      } catch {
        if (alive) setOnline(false);
      }
    };
    tick();
    const id = setInterval(tick, 400);
    return () => { alive = false; clearInterval(id); };
  }, []);

  // Alt+P: global in Tauri (Rust emits "toggle"), in-window in browser
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    if (isTauri) {
      import("@tauri-apps/api/event").then(({ listen }) =>
        listen("toggle", () => flip()).then((u) => (unlisten = u)),
      );
    } else {
      const onKey = (e: KeyboardEvent) => {
        if (e.altKey && e.key.toLowerCase() === "p") { e.preventDefault(); flip(); }
      };
      window.addEventListener("keydown", onKey);
      unlisten = () => window.removeEventListener("keydown", onKey);
    }
    return () => unlisten?.();
  }, [flip]);

  const label = !online ? "Backend offline" : recording ? "Listening…" : msg;

  return (
    <div className="pill" data-tauri-drag-region>
      <button
        className={`mic ${recording ? "on" : ""}`}
        onClick={flip}
        aria-label={recording ? "Stop" : "Start"}
        disabled={!online}
      >
        {recording ? <span className="sq" /> : (
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" stroke="none" />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
          </svg>
        )}
      </button>
      <div className="wave" data-tauri-drag-region aria-hidden>
        {Array.from({ length: 9 }).map((_, i) => (
          <i key={i} className={recording ? "live" : ""} style={{ animationDelay: `${i * 80}ms` }} />
        ))}
      </div>
      <span className="label" data-tauri-drag-region title={label}>{label}</span>
      <kbd data-tauri-drag-region>⌥P</kbd>
    </div>
  );
}
