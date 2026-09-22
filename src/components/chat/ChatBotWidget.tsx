"use client";

import { useState } from "react";

export default function ChatBotWidget() {
  const [open, setOpen] = useState(false);
  return <button className="chat-widget" onClick={() => setOpen((value) => !value)} aria-label="Mo tro ly mua sam">{open ? "Dong tro ly" : "Can giup?"}</button>;
}
