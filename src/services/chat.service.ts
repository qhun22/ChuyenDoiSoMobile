import { apiFetch } from "./api";
export function sendChatMessage(message: string) { return apiFetch<{ reply: string }>("/chat/", { method: "POST", body: JSON.stringify({ message }) }); }
