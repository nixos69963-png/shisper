const PORT = import.meta.env.VITE_WHISPER_FLOW_PORT ?? "8765";
export const API = `http://127.0.0.1:${PORT}`;

export type Status = { recording: boolean; model: string; messages: string[] };

export async function getStatus(): Promise<Status> {
  const r = await fetch(`${API}/api/status`);
  if (!r.ok) throw new Error("status failed");
  return r.json();
}

export async function toggle(): Promise<{ recording: boolean }> {
  const r = await fetch(`${API}/api/toggle`, { method: "POST" });
  if (!r.ok) throw new Error("toggle failed");
  return r.json();
}
